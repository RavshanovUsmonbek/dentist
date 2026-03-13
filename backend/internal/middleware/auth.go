package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/usmonbek/dentist-backend/internal/services"
)

// ContextKey is a custom type for context keys
type ContextKey string

// UserContextKey is the key used to store user claims in the request context
const UserContextKey ContextKey = "user"

// Auth creates a middleware that validates JWT tokens
func Auth(authService *services.AuthService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, `{"success":false,"error":"Authorization header required"}`, http.StatusUnauthorized)
				return
			}

			// Check for Bearer prefix
			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			if tokenString == authHeader {
				http.Error(w, `{"success":false,"error":"Invalid authorization header format"}`, http.StatusUnauthorized)
				return
			}

			// Validate token
			claims, err := authService.ValidateToken(tokenString)
			if err != nil {
				http.Error(w, `{"success":false,"error":"Invalid or expired token"}`, http.StatusUnauthorized)
				return
			}

			// Add claims to context
			ctx := context.WithValue(r.Context(), UserContextKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// AuthFunc creates a middleware function for use with http.HandlerFunc
func AuthFunc(authService *services.AuthService, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"success":false,"error":"Authorization header required"}`, http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			http.Error(w, `{"success":false,"error":"Invalid authorization header format"}`, http.StatusUnauthorized)
			return
		}

		claims, err := authService.ValidateToken(tokenString)
		if err != nil {
			http.Error(w, `{"success":false,"error":"Invalid or expired token"}`, http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserContextKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// GetUserFromContext retrieves the user claims from the request context
func GetUserFromContext(r *http.Request) *services.JWTClaims {
	claims, ok := r.Context().Value(UserContextKey).(*services.JWTClaims)
	if !ok {
		return nil
	}
	return claims
}
