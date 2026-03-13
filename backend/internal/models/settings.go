package models

import "time"

// SiteSetting represents a key-value configuration setting
type SiteSetting struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Key         string    `json:"key" gorm:"type:varchar(100);not null;uniqueIndex"`
	Value       string    `json:"value" gorm:"type:text;not null"`
	Type        string    `json:"type" gorm:"type:varchar(20);default:'string'"`
	Description string    `json:"description" gorm:"type:varchar(500)"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName specifies the table name for SiteSetting
func (SiteSetting) TableName() string {
	return "site_settings"
}

// SiteContent represents section-based dynamic content
type SiteContent struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Section   string    `json:"section" gorm:"type:varchar(50);not null"`
	Key       string    `json:"key" gorm:"type:varchar(100);not null"`
	Value     string    `json:"value" gorm:"type:text;not null"`
	Type      string    `json:"type" gorm:"type:varchar(20);default:'string'"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName specifies the table name for SiteContent
func (SiteContent) TableName() string {
	return "site_content"
}

// SettingUpdateRequest represents the request body for updating a setting
type SettingUpdateRequest struct {
	Value string `json:"value" validate:"required"`
}

// ContentUpdateRequest represents the request body for updating content
type ContentUpdateRequest struct {
	Value string `json:"value" validate:"required"`
}

// SettingsMap is a helper type for returning settings as a key-value map
type SettingsMap map[string]string

// ContentMap is a helper type for returning section content as a key-value map
type ContentMap map[string]string
