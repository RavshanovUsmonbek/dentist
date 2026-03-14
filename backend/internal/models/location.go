package models

import "time"

// Location represents a physical location where the doctor works
type Location struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	Name          string    `json:"name" gorm:"type:varchar(200);not null"`
	AddressLine1  string    `json:"address_line1" gorm:"type:varchar(255);not null"`
	AddressLine2  string    `json:"address_line2" gorm:"type:varchar(255)"`
	City          string    `json:"city" gorm:"type:varchar(100);not null"`
	State         string    `json:"state" gorm:"type:varchar(50)"`
	PostalCode    string    `json:"postal_code" gorm:"type:varchar(20)"`
	Phone         string    `json:"phone" gorm:"type:varchar(20)"`
	Email         string    `json:"email" gorm:"type:varchar(255)"`
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
	AddressLine1  string   `json:"address_line1" validate:"required,max=255"`
	AddressLine2  string   `json:"address_line2" validate:"omitempty,max=255"`
	City          string   `json:"city" validate:"required,max=100"`
	State         string   `json:"state" validate:"omitempty,max=50"`
	PostalCode    string   `json:"postal_code" validate:"omitempty,max=20"`
	Phone         string   `json:"phone" validate:"omitempty,max=20"`
	Email         string   `json:"email" validate:"omitempty,email,max=255"`
	DaysOfWeek    []string `json:"days_of_week" validate:"required,min=1,dive,oneof=monday tuesday wednesday thursday friday saturday sunday"`
	HoursWeekday  string   `json:"hours_weekday" validate:"omitempty,max=100"`
	HoursSaturday string   `json:"hours_saturday" validate:"omitempty,max=100"`
	HoursSunday   string   `json:"hours_sunday" validate:"omitempty,max=100"`
	DisplayOrder  int      `json:"display_order" validate:"omitempty,min=0"`
	Active        *bool    `json:"active" validate:"omitempty"`
}
