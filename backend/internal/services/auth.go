package services

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/usmonbek/dentist-backend/internal/models"
	"golang.org/x/crypto/bcrypt"
)

// AuthService handles JWT token operations and password hashing
type AuthService struct {
	jwtSecret     []byte
	jwtExpiration time.Duration
}

// JWTClaims represents the claims in a JWT token
type JWTClaims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	jwt.RegisteredClaims
}

// NewAuthService creates a new AuthService
func NewAuthService(secret string, expiration time.Duration) *AuthService {
	return &AuthService{
		jwtSecret:     []byte(secret),
		jwtExpiration: expiration,
	}
}

// GenerateToken generates a JWT token for an admin user
func (s *AuthService) GenerateToken(user *models.AdminUser) (string, error) {
	claims := JWTClaims{
		UserID:   user.ID,
		Username: user.Username,
		Email:    user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.jwtExpiration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "dentist-admin",
			Subject:   user.Username,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

// ValidateToken validates a JWT token and returns the claims
func (s *AuthService) ValidateToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return s.jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// HashPassword hashes a password using bcrypt
func (s *AuthService) HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// CheckPassword compares a hashed password with a plain text password
func (s *AuthService) CheckPassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

// ParseExpiration parses a duration string (e.g., "24h", "1h30m")
func ParseExpiration(expStr string) (time.Duration, error) {
	return time.ParseDuration(expStr)
}
