package models

import (
	"time"

	"gorm.io/datatypes"
)

// GalleryImage represents a gallery image in the database
type GalleryImage struct {
	ID           uint              `json:"id" gorm:"primaryKey"`
	Filename     string            `json:"filename" gorm:"type:varchar(255);not null"`
	AltText      string            `json:"alt_text" gorm:"type:varchar(500);not null"`
	Category     string            `json:"category" gorm:"type:varchar(50);default:'general'"`
	Tags         string            `json:"tags" gorm:"type:text"`
	DisplayOrder int               `json:"display_order" gorm:"default:0"`
	Active       bool              `json:"active" gorm:"default:true"`
	Translations datatypes.JSONMap `json:"translations" gorm:"type:jsonb;default:'{}'"`
	CreatedAt    time.Time         `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time         `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName specifies the table name for GalleryImage
func (GalleryImage) TableName() string {
	return "gallery_images"
}

// GalleryImageRequest represents the request body for creating/updating a gallery image
type GalleryImageRequest struct {
	Filename     string                 `json:"filename" validate:"required,max=255"`
	AltText      string                 `json:"alt_text" validate:"required,min=2,max=500"`
	Category     string                 `json:"category" validate:"omitempty,max=50"`
	Tags         string                 `json:"tags" validate:"omitempty"`
	DisplayOrder int                    `json:"display_order" validate:"omitempty,min=0"`
	Active       *bool                  `json:"active" validate:"omitempty"`
	Translations map[string]interface{} `json:"translations" validate:"omitempty"`
}
