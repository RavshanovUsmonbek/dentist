package models

import "time"

// GalleryCategory represents a category for organizing gallery images
type GalleryCategory struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Slug         string    `gorm:"uniqueIndex;size:50;not null" json:"slug"`
	Label        string    `gorm:"size:100;not null" json:"label"`
	Description  string    `gorm:"type:text" json:"description"`
	DisplayOrder int       `gorm:"default:0" json:"display_order"`
	Enabled      bool      `gorm:"default:true" json:"enabled"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// TableName specifies the table name for GORM
func (GalleryCategory) TableName() string {
	return "gallery_categories"
}

// GalleryCategoryRequest represents a request to create/update a gallery category
type GalleryCategoryRequest struct {
	Slug         string `json:"slug" validate:"required,max=50,alphanum"`
	Label        string `json:"label" validate:"required,max=100"`
	Description  string `json:"description"`
	DisplayOrder int    `json:"display_order"`
	Enabled      bool   `json:"enabled"`
}
