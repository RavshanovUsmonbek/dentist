package models

import "time"

// AdminUser represents an admin user in the database
type AdminUser struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	Username     string     `json:"username" gorm:"type:varchar(50);not null;uniqueIndex"`
	Email        string     `json:"email" gorm:"type:varchar(255);not null;uniqueIndex"`
	PasswordHash string     `json:"-" gorm:"type:varchar(255);not null"`
	FullName     string     `json:"full_name" gorm:"type:varchar(100)"`
	Active       bool       `json:"active" gorm:"default:true"`
	CreatedAt    time.Time  `json:"created_at" gorm:"autoCreateTime"`
	LastLogin    *time.Time `json:"last_login"`
}

// TableName specifies the table name for AdminUser
func (AdminUser) TableName() string {
	return "admin_users"
}

// LoginRequest represents the login request body
type LoginRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
	Password string `json:"password" validate:"required,min=6,max=100"`
}

// LoginResponse represents the login response
type LoginResponse struct {
	Success bool   `json:"success"`
	Token   string `json:"token,omitempty"`
	User    *struct {
		ID       uint   `json:"id"`
		Username string `json:"username"`
		Email    string `json:"email"`
		FullName string `json:"full_name"`
	} `json:"user,omitempty"`
	Error string `json:"error,omitempty"`
}

// TokenClaims represents JWT token claims
type TokenClaims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
}
