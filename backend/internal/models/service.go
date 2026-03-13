package models

import "time"

// Service represents a dental service in the database
type Service struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Title        string    `json:"title" gorm:"type:varchar(200);not null"`
	Description  string    `json:"description" gorm:"type:text;not null"`
	Icon         string    `json:"icon" gorm:"type:varchar(50);not null"`
	DisplayOrder int       `json:"display_order" gorm:"default:0"`
	Active       bool      `json:"active" gorm:"default:true"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName specifies the table name for Service
func (Service) TableName() string {
	return "services"
}

// ServiceRequest represents the request body for creating/updating a service
type ServiceRequest struct {
	Title        string `json:"title" validate:"required,min=2,max=200"`
	Description  string `json:"description" validate:"required,min=10,max=2000"`
	Icon         string `json:"icon" validate:"required,max=50"`
	DisplayOrder int    `json:"display_order" validate:"omitempty,min=0"`
	Active       *bool  `json:"active" validate:"omitempty"`
}
