package models

import "time"

// Location represents a physical location where the doctor works
type Location struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	Name          string    `json:"name" gorm:"type:varchar(200);not null"`
	Address       string    `json:"address" gorm:"type:varchar(500);not null"`
	DaysOfWeek    string    `json:"days_of_week" gorm:"type:text;not null"` // JSON array stored as string
	HoursWeekday  string    `json:"hours_weekday" gorm:"type:varchar(100)"`
	HoursSaturday string    `json:"hours_saturday" gorm:"type:varchar(100)"`
	HoursSunday   string    `json:"hours_sunday" gorm:"type:varchar(100)"`
	DisplayOrder  int       `json:"display_order" gorm:"default:0"`
	Active        bool      `json:"active" gorm:"default:true"`
	CreatedAt     time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt     time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName specifies the table name for Location
func (Location) TableName() string {
	return "locations"
}

// LocationRequest represents the request body for creating/updating a location
type LocationRequest struct {
	Name          string   `json:"name" validate:"required,min=2,max=200"`
	Address       string   `json:"address" validate:"required,max=500"`
	DaysOfWeek    []string `json:"days_of_week" validate:"required,min=1,dive,oneof=monday tuesday wednesday thursday friday saturday sunday"`
	HoursWeekday  string   `json:"hours_weekday" validate:"omitempty,max=100"`
	HoursSaturday string   `json:"hours_saturday" validate:"omitempty,max=100"`
	HoursSunday   string   `json:"hours_sunday" validate:"omitempty,max=100"`
	DisplayOrder  int      `json:"display_order" validate:"omitempty,min=0"`
	Active        *bool    `json:"active" validate:"omitempty"`
}
