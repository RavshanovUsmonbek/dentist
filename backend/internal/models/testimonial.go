package models

import "time"

// Testimonial represents a patient testimonial in the database
type Testimonial struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Name         string    `json:"name" gorm:"type:varchar(100);not null"`
	Initials     string    `json:"initials" gorm:"type:varchar(5);not null"`
	Rating       int       `json:"rating" gorm:"not null;check:rating >= 1 AND rating <= 5"`
	Text         string    `json:"text" gorm:"type:text;not null"`
	DisplayOrder int       `json:"display_order" gorm:"default:0"`
	Active       bool      `json:"active" gorm:"default:true"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName specifies the table name for Testimonial
func (Testimonial) TableName() string {
	return "testimonials"
}

// TestimonialRequest represents the request body for creating/updating a testimonial
type TestimonialRequest struct {
	Name         string `json:"name" validate:"required,min=2,max=100"`
	Initials     string `json:"initials" validate:"required,min=1,max=5"`
	Rating       int    `json:"rating" validate:"required,min=1,max=5"`
	Text         string `json:"text" validate:"required,min=10,max=2000"`
	DisplayOrder int    `json:"display_order" validate:"omitempty,min=0"`
	Active       *bool  `json:"active" validate:"omitempty"`
}
