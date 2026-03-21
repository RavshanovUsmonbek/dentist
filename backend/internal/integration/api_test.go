// Package integration contains end-to-end HTTP API tests that run against a
// real PostgreSQL database.  They are skipped automatically when the
// TEST_DATABASE_URL environment variable is not set, so they never block
// plain `go test ./...` runs without a database.
//
// To run locally:
//
//	TEST_DATABASE_URL="postgres://dentist_user:password@localhost:5432/dentist_db?sslmode=disable" \
//	    go test ./internal/integration/... -v
package integration_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/usmonbek/dentist-backend/internal/handlers"
	"github.com/usmonbek/dentist-backend/internal/middleware"
	"github.com/usmonbek/dentist-backend/internal/models"
	"github.com/usmonbek/dentist-backend/internal/repository"
	"github.com/usmonbek/dentist-backend/internal/services"
)

// ── shared state set up once in TestMain ──────────────────────────────────

const (
	testJWTSecret   = "integration-test-jwt-secret-min-32-chars!!"
	testAdminUser   = "integ_test_admin"
	testAdminPass   = "integ_test_pass123"
	testAdminEmail  = "integ_test@example.com"
)

var (
	srv         *httptest.Server
	testDB      *gorm.DB
	testAuthSvc *services.AuthService
	serviceRepo *repository.ServiceRepository
	adminRepo   *repository.AdminRepository
)

func TestMain(m *testing.M) {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		fmt.Println("TEST_DATABASE_URL not set — skipping integration tests")
		os.Exit(0)
	}

	var err error
	testDB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		fmt.Printf("connect to test DB: %v\n", err)
		os.Exit(1)
	}

	// Services and repos
	testAuthSvc = services.NewAuthService(testJWTSecret, 24*time.Hour)
	validator := services.NewValidator()

	adminRepo = repository.NewAdminRepository(testDB)
	serviceRepo = repository.NewServiceRepository(testDB)
	testimonialRepo := repository.NewTestimonialRepository(testDB)
	galleryRepo := repository.NewGalleryRepository(testDB)
	galleryCategoryRepo := repository.NewGalleryCategoryRepository(testDB)
	locationRepo := repository.NewLocationRepository(testDB)
	settingsRepo := repository.NewSettingsRepository(testDB)

	// Seed test admin (hard-delete any leftover, then create fresh)
	testDB.Exec("DELETE FROM admin_users WHERE username = ?", testAdminUser)
	hash, err := testAuthSvc.HashPassword(testAdminPass)
	if err != nil {
		fmt.Printf("hash password: %v\n", err)
		os.Exit(1)
	}
	if err := adminRepo.Create(&models.AdminUser{
		Username:     testAdminUser,
		Email:        testAdminEmail,
		PasswordHash: hash,
		FullName:     "Integration Test Admin",
		Active:       true,
	}); err != nil {
		fmt.Printf("create test admin: %v\n", err)
		os.Exit(1)
	}

	// Build router (mirrors main.go for the routes we exercise)
	mux := http.NewServeMux()

	authHandler := handlers.NewAdminAuthHandler(adminRepo, testAuthSvc, validator)
	svcHandler := handlers.NewAdminServicesHandler(serviceRepo, validator)
	pubHandler := handlers.NewPublicHandler(
		serviceRepo, testimonialRepo, galleryRepo,
		galleryCategoryRepo, locationRepo, settingsRepo, validator,
	)

	mux.HandleFunc("/api/health", handlers.HandleHealth)
	mux.HandleFunc("/api/services", pubHandler.HandleServices)
	mux.HandleFunc("/api/admin/login", authHandler.HandleLogin)
	mux.HandleFunc("/api/admin/me", middleware.AuthFunc(testAuthSvc, authHandler.HandleMe))
	mux.HandleFunc("/api/admin/services", middleware.AuthFunc(testAuthSvc, svcHandler.HandleServices))
	mux.Handle("/api/admin/services/",
		middleware.Auth(testAuthSvc)(http.HandlerFunc(svcHandler.HandleService)))

	srv = httptest.NewServer(mux)

	code := m.Run()

	srv.Close()
	testDB.Exec("DELETE FROM admin_users WHERE username = ?", testAdminUser)
	os.Exit(code)
}

// ── request / response helpers ────────────────────────────────────────────

func do(t *testing.T, method, path string, body interface{}, token string) *http.Response {
	t.Helper()
	var b []byte
	if body != nil {
		var err error
		b, err = json.Marshal(body)
		require.NoError(t, err)
	}
	req, err := http.NewRequest(method, srv.URL+path, bytes.NewReader(b))
	require.NoError(t, err)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := http.DefaultClient.Do(req)
	require.NoError(t, err)
	return resp
}

func decodeJSON(t *testing.T, resp *http.Response) map[string]interface{} {
	t.Helper()
	defer resp.Body.Close()
	var out map[string]interface{}
	require.NoError(t, json.NewDecoder(resp.Body).Decode(&out))
	return out
}

// loginAdmin performs a login and returns the JWT token.
func loginAdmin(t *testing.T) string {
	t.Helper()
	resp := do(t, http.MethodPost, "/api/admin/login", map[string]string{
		"username": testAdminUser,
		"password": testAdminPass,
	}, "")
	require.Equal(t, http.StatusOK, resp.StatusCode)
	body := decodeJSON(t, resp)
	token, ok := body["token"].(string)
	require.True(t, ok, "expected token in login response")
	return token
}

// ── tests ─────────────────────────────────────────────────────────────────

func TestHealth(t *testing.T) {
	resp := do(t, http.MethodGet, "/api/health", nil, "")
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	body := decodeJSON(t, resp)
	assert.Equal(t, "healthy", body["status"])
}

// ── auth ──────────────────────────────────────────────────────────────────

func TestLogin_ValidCredentials(t *testing.T) {
	resp := do(t, http.MethodPost, "/api/admin/login", map[string]string{
		"username": testAdminUser,
		"password": testAdminPass,
	}, "")
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	body := decodeJSON(t, resp)
	assert.True(t, body["success"].(bool))
	assert.NotEmpty(t, body["token"])
	user := body["user"].(map[string]interface{})
	assert.Equal(t, testAdminUser, user["username"])
}

func TestLogin_WrongPassword(t *testing.T) {
	resp := do(t, http.MethodPost, "/api/admin/login", map[string]string{
		"username": testAdminUser,
		"password": "completely_wrong",
	}, "")
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestLogin_NonExistentUser(t *testing.T) {
	resp := do(t, http.MethodPost, "/api/admin/login", map[string]string{
		"username": "nobody_here_123",
		"password": "somepassword",
	}, "")
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestLogin_ValidationError(t *testing.T) {
	// username too short (min=3), password missing
	resp := do(t, http.MethodPost, "/api/admin/login", map[string]string{
		"username": "x",
	}, "")
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
}

// ── auth middleware ────────────────────────────────────────────────────────

func TestProtectedEndpoint_NoToken(t *testing.T) {
	resp := do(t, http.MethodGet, "/api/admin/services", nil, "")
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestProtectedEndpoint_InvalidToken(t *testing.T) {
	resp := do(t, http.MethodGet, "/api/admin/services", nil, "garbage.token.value")
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestProtectedEndpoint_WrongSecret(t *testing.T) {
	other := services.NewAuthService("other-secret-key-totally-different-32chars!", 24*time.Hour)
	token, err := other.GenerateToken(&models.AdminUser{ID: 99, Username: "spy", Email: "spy@test.com"})
	require.NoError(t, err)
	resp := do(t, http.MethodGet, "/api/admin/services", nil, token)
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestProtectedEndpoint_ExpiredToken(t *testing.T) {
	expiredSvc := services.NewAuthService(testJWTSecret, -1*time.Second)
	token, err := expiredSvc.GenerateToken(&models.AdminUser{ID: 1, Username: testAdminUser, Email: testAdminEmail})
	require.NoError(t, err)
	resp := do(t, http.MethodGet, "/api/admin/services", nil, token)
	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestAdminMe(t *testing.T) {
	token := loginAdmin(t)
	resp := do(t, http.MethodGet, "/api/admin/me", nil, token)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	body := decodeJSON(t, resp)
	data := body["data"].(map[string]interface{})
	assert.Equal(t, testAdminUser, data["username"])
}

// ── services CRUD ─────────────────────────────────────────────────────────

func TestServicesCRUD(t *testing.T) {
	token := loginAdmin(t)
	const title = "Integ CRUD Service"
	t.Cleanup(func() {
		testDB.Exec("DELETE FROM services WHERE title = ?", title)
	})

	// CREATE
	resp := do(t, http.MethodPost, "/api/admin/services", map[string]interface{}{
		"title":       title,
		"description": "Full CRUD integration test service",
		"icon":        "FaTooth",
	}, token)
	require.Equal(t, http.StatusCreated, resp.StatusCode)
	created := decodeJSON(t, resp)
	data := created["data"].(map[string]interface{})
	id := uint(data["id"].(float64))
	assert.Equal(t, title, data["title"])
	assert.Equal(t, "FaTooth", data["icon"])

	// LIST — should contain the new item
	resp = do(t, http.MethodGet, "/api/admin/services", nil, token)
	require.Equal(t, http.StatusOK, resp.StatusCode)
	list := decodeJSON(t, resp)
	found := false
	for _, item := range list["data"].([]interface{}) {
		if item.(map[string]interface{})["title"] == title {
			found = true
			break
		}
	}
	assert.True(t, found, "new service not in admin list")

	// GET by ID
	resp = do(t, http.MethodGet, fmt.Sprintf("/api/admin/services/%d", id), nil, token)
	require.Equal(t, http.StatusOK, resp.StatusCode)
	got := decodeJSON(t, resp)
	assert.Equal(t, title, got["data"].(map[string]interface{})["title"])

	// UPDATE
	resp = do(t, http.MethodPut, fmt.Sprintf("/api/admin/services/%d", id), map[string]interface{}{
		"title":       title,
		"description": "Updated description for integration test",
		"icon":        "FaSmile",
	}, token)
	require.Equal(t, http.StatusOK, resp.StatusCode)
	updated := decodeJSON(t, resp)
	assert.Equal(t, "FaSmile", updated["data"].(map[string]interface{})["icon"])

	// DELETE
	resp = do(t, http.MethodDelete, fmt.Sprintf("/api/admin/services/%d", id), nil, token)
	require.Equal(t, http.StatusOK, resp.StatusCode)

	// VERIFY gone
	resp = do(t, http.MethodGet, fmt.Sprintf("/api/admin/services/%d", id), nil, token)
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestCreateService_ValidationError(t *testing.T) {
	token := loginAdmin(t)
	// Missing required fields: description and icon
	resp := do(t, http.MethodPost, "/api/admin/services", map[string]interface{}{
		"title": "No Description Or Icon",
	}, token)
	assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	body := decodeJSON(t, resp)
	assert.False(t, body["success"].(bool))
}

func TestGetService_NotFound(t *testing.T) {
	token := loginAdmin(t)
	resp := do(t, http.MethodGet, "/api/admin/services/999999", nil, token)
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

func TestDeleteService_NotFound(t *testing.T) {
	token := loginAdmin(t)
	resp := do(t, http.MethodDelete, "/api/admin/services/999999", nil, token)
	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

// ── public endpoint ───────────────────────────────────────────────────────

func TestPublicServices_OnlyReturnsActive(t *testing.T) {
	token := loginAdmin(t)
	inactive := false
	const activeTitle = "Integ Public Active"
	const inactiveTitle = "Integ Public Inactive"
	t.Cleanup(func() {
		testDB.Exec("DELETE FROM services WHERE title IN ?", []string{activeTitle, inactiveTitle})
	})

	// Create active service
	resp := do(t, http.MethodPost, "/api/admin/services", map[string]interface{}{
		"title":       activeTitle,
		"description": "Active service for public endpoint test",
		"icon":        "FaTooth",
	}, token)
	require.Equal(t, http.StatusCreated, resp.StatusCode)

	// Create inactive service
	resp = do(t, http.MethodPost, "/api/admin/services", map[string]interface{}{
		"title":       inactiveTitle,
		"description": "Inactive service for public endpoint test",
		"icon":        "FaTooth",
		"active":      &inactive,
	}, token)
	require.Equal(t, http.StatusCreated, resp.StatusCode)

	// Public endpoint
	resp = do(t, http.MethodGet, "/api/services", nil, "")
	require.Equal(t, http.StatusOK, resp.StatusCode)
	body := decodeJSON(t, resp)
	items, ok := body["data"].([]interface{})
	require.True(t, ok)

	var titles []string
	for _, item := range items {
		if title, ok := item.(map[string]interface{})["title"].(string); ok {
			titles = append(titles, title)
		}
	}
	assert.Contains(t, titles, activeTitle)
	assert.NotContains(t, titles, inactiveTitle)
}

func TestPublicServices_NoAuthRequired(t *testing.T) {
	// Public endpoint must work without any token
	resp := do(t, http.MethodGet, "/api/services", nil, "")
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}
