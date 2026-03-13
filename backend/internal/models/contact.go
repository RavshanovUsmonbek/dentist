package models

import "time"

// ContactRequest represents incoming contact form data
type ContactRequest struct {
	Name      string    `json:"name" validate:"required,min=2,max=100"`
	Email     string    `json:"email" validate:"required,email"`
	Phone     string    `json:"phone" validate:"omitempty,min=7,max=20"`
	Message   string    `json:"message" validate:"required,min=10,max=1000"`
	Timestamp time.Time `json:"timestamp"`
}

// ContactSubmission represents a contact form submission in the database
type ContactSubmission struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"type:varchar(100);not null"`
	Email     string    `json:"email" gorm:"type:varchar(255);not null"`
	Phone     string    `json:"phone" gorm:"type:varchar(20)"`
	Message   string    `json:"message" gorm:"type:text;not null"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	Read      bool      `json:"read" gorm:"default:false"`
	Notes     string    `json:"notes" gorm:"type:text"`
}

// TableName specifies the table name for ContactSubmission
func (ContactSubmission) TableName() string {
	return "contact_submissions"
}

type ContactResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Error   string `json:"error,omitempty"`
}

type HealthResponse struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
}
