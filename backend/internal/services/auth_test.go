package services

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/usmonbek/dentist-backend/internal/models"
)

func newTestAuthService() *AuthService {
	return NewAuthService("test-secret-key-minimum-32-chars!!", 24*time.Hour)
}

func newTestUser() *models.AdminUser {
	return &models.AdminUser{
		ID:       1,
		Username: "admin",
		Email:    "admin@example.com",
	}
}

func TestGenerateAndValidateToken(t *testing.T) {
	svc := newTestAuthService()
	user := newTestUser()

	token, err := svc.GenerateToken(user)
	require.NoError(t, err)
	require.NotEmpty(t, token)

	claims, err := svc.ValidateToken(token)
	require.NoError(t, err)
	assert.Equal(t, user.ID, claims.UserID)
	assert.Equal(t, user.Username, claims.Username)
	assert.Equal(t, user.Email, claims.Email)
}

func TestValidateToken_InvalidSignature(t *testing.T) {
	svc := newTestAuthService()
	otherSvc := NewAuthService("different-secret-key-min-32-chars!!", 24*time.Hour)

	token, err := svc.GenerateToken(newTestUser())
	require.NoError(t, err)

	_, err = otherSvc.ValidateToken(token)
	assert.Error(t, err)
}

func TestValidateToken_Malformed(t *testing.T) {
	svc := newTestAuthService()

	_, err := svc.ValidateToken("not.a.valid.token")
	assert.Error(t, err)

	_, err = svc.ValidateToken("")
	assert.Error(t, err)
}

func TestValidateToken_Expired(t *testing.T) {
	svc := NewAuthService("test-secret-key-minimum-32-chars!!", -1*time.Second)

	token, err := svc.GenerateToken(newTestUser())
	require.NoError(t, err)

	_, err = svc.ValidateToken(token)
	assert.Error(t, err)
}

func TestHashAndCheckPassword(t *testing.T) {
	svc := newTestAuthService()

	hash, err := svc.HashPassword("password123")
	require.NoError(t, err)
	require.NotEmpty(t, hash)
	assert.NotEqual(t, "password123", hash)

	assert.True(t, svc.CheckPassword(hash, "password123"))
}

func TestCheckPassword_Wrong(t *testing.T) {
	svc := newTestAuthService()

	hash, err := svc.HashPassword("correctpassword")
	require.NoError(t, err)

	assert.False(t, svc.CheckPassword(hash, "wrongpassword"))
}

func TestCheckPassword_EmptyPassword(t *testing.T) {
	svc := newTestAuthService()

	hash, err := svc.HashPassword("somepassword")
	require.NoError(t, err)

	assert.False(t, svc.CheckPassword(hash, ""))
}

func TestParseExpiration_Valid(t *testing.T) {
	cases := []struct {
		input    string
		expected time.Duration
	}{
		{"24h", 24 * time.Hour},
		{"1h30m", 90 * time.Minute},
		{"30m", 30 * time.Minute},
		{"1h", time.Hour},
		{"48h", 48 * time.Hour},
	}

	for _, tc := range cases {
		t.Run(tc.input, func(t *testing.T) {
			d, err := ParseExpiration(tc.input)
			require.NoError(t, err)
			assert.Equal(t, tc.expected, d)
		})
	}
}

func TestParseExpiration_Invalid(t *testing.T) {
	_, err := ParseExpiration("bad")
	assert.Error(t, err)

	_, err = ParseExpiration("24hours")
	assert.Error(t, err)

	_, err = ParseExpiration("")
	assert.Error(t, err)
}
