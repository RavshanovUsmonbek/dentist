package handlers

import (
	"net/http"

	"github.com/usmonbek/dentist-backend/internal/middleware"
	"github.com/usmonbek/dentist-backend/internal/models"
	"github.com/usmonbek/dentist-backend/internal/repository"
	"github.com/usmonbek/dentist-backend/internal/services"
)

// AdminAuthHandler handles admin authentication endpoints
type AdminAuthHandler struct {
	adminRepo   *repository.AdminRepository
	authService *services.AuthService
	validator   *services.Validator
}

// NewAdminAuthHandler creates a new AdminAuthHandler
func NewAdminAuthHandler(adminRepo *repository.AdminRepository, authService *services.AuthService, validator *services.Validator) *AdminAuthHandler {
	return &AdminAuthHandler{
		adminRepo:   adminRepo,
		authService: authService,
		validator:   validator,
	}
}

// HandleLogin handles POST /api/admin/login
func (h *AdminAuthHandler) HandleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendMethodNotAllowed(w)
		return
	}

	var req models.LoginRequest
	if err := decodeJSON(r, &req); err != nil {
		sendBadRequest(w, "Invalid request body")
		return
	}

	if err := h.validator.Validate(&req); err != nil {
		sendBadRequest(w, err.Error())
		return
	}

	// Find user by username
	user, err := h.adminRepo.FindByUsername(req.Username)
	if err != nil {
		sendUnauthorized(w, "Invalid credentials")
		return
	}

	// Check password
	if !h.authService.CheckPassword(user.PasswordHash, req.Password) {
		sendUnauthorized(w, "Invalid credentials")
		return
	}

	// Generate token
	token, err := h.authService.GenerateToken(user)
	if err != nil {
		sendInternalError(w, "Failed to generate token")
		return
	}

	// Update last login
	h.adminRepo.UpdateLastLogin(user.ID)

	response := models.LoginResponse{
		Success: true,
		Token:   token,
		User: &struct {
			ID       uint   `json:"id"`
			Username string `json:"username"`
			Email    string `json:"email"`
			FullName string `json:"full_name"`
		}{
			ID:       user.ID,
			Username: user.Username,
			Email:    user.Email,
			FullName: user.FullName,
		},
	}

	sendJSON(w, response, http.StatusOK)
}

// HandleChangePassword handles POST /api/admin/change-password
func (h *AdminAuthHandler) HandleChangePassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendMethodNotAllowed(w)
		return
	}

	claims := middleware.GetUserFromContext(r)
	if claims == nil {
		sendUnauthorized(w, "Not authenticated")
		return
	}

	var req struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}
	if err := decodeJSON(r, &req); err != nil {
		sendBadRequest(w, "Invalid request body")
		return
	}
	if req.CurrentPassword == "" || req.NewPassword == "" {
		sendBadRequest(w, "current_password and new_password are required")
		return
	}
	if len(req.NewPassword) < 6 {
		sendBadRequest(w, "New password must be at least 6 characters")
		return
	}

	user, err := h.adminRepo.FindByID(claims.UserID)
	if err != nil {
		sendNotFound(w, "User not found")
		return
	}

	if !h.authService.CheckPassword(user.PasswordHash, req.CurrentPassword) {
		sendUnauthorized(w, "Current password is incorrect")
		return
	}

	hash, err := h.authService.HashPassword(req.NewPassword)
	if err != nil {
		sendInternalError(w, "Failed to hash password")
		return
	}

	user.PasswordHash = hash
	if err := h.adminRepo.Update(user); err != nil {
		sendInternalError(w, "Failed to update password")
		return
	}

	sendSuccess(w, map[string]string{"message": "Password updated successfully"})
}

// HandleMe handles GET /api/admin/me
func (h *AdminAuthHandler) HandleMe(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendMethodNotAllowed(w)
		return
	}

	claims := middleware.GetUserFromContext(r)
	if claims == nil {
		sendUnauthorized(w, "Not authenticated")
		return
	}

	user, err := h.adminRepo.FindByID(claims.UserID)
	if err != nil {
		sendNotFound(w, "User not found")
		return
	}

	// Don't send password hash
	userData := map[string]interface{}{
		"id":         user.ID,
		"username":   user.Username,
		"email":      user.Email,
		"full_name":  user.FullName,
		"active":     user.Active,
		"created_at": user.CreatedAt,
		"last_login": user.LastLogin,
	}

	sendSuccess(w, userData)
}
