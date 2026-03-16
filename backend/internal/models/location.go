package models

import (
	"time"

	"gorm.io/datatypes"
)

// DayHours represents business hours for a single day
type DayHours struct {
	Start string `json:"start"` // HH:MM format (24-hour)
	End   string `json:"end"`   // HH:MM format (24-hour)
}

// Location represents a physical location where the doctor works
type Location struct {
	ID            uint                 `json:"id" gorm:"primaryKey"`
	Name          string               `json:"name" gorm:"type:varchar(200);not null"`
	Address       string               `json:"address" gorm:"type:varchar(500);not null"`
	BusinessHours map[string]*DayHours `json:"business_hours" gorm:"type:jsonb;serializer:json"`
	Latitude      *float64             `json:"latitude" gorm:"type:decimal(10,8)"`
	Longitude     *float64             `json:"longitude" gorm:"type:decimal(11,8)"`
	DisplayOrder  int                  `json:"display_order" gorm:"default:0"`
	Active        bool                 `json:"active" gorm:"default:true"`
	Translations  datatypes.JSONMap    `json:"translations" gorm:"type:jsonb;default:'{}'"`
	CreatedAt     time.Time            `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt     time.Time            `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName specifies the table name for Location
func (Location) TableName() string {
	return "locations"
}

// LocationRequest represents the request body for creating/updating a location
type LocationRequest struct {
	Name          string                  `json:"name" validate:"required,min=2,max=200"`
	Address       string                  `json:"address" validate:"required,max=500"`
	BusinessHours map[string]*DayHours    `json:"business_hours" validate:"omitempty"`
	Latitude      *float64                `json:"latitude" validate:"omitempty"`
	Longitude     *float64                `json:"longitude" validate:"omitempty"`
	DisplayOrder  int                     `json:"display_order" validate:"omitempty,min=0"`
	Active        *bool                   `json:"active" validate:"omitempty"`
	Translations  map[string]interface{}  `json:"translations" validate:"omitempty"`
}
