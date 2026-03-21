package models

import (
	"time"

	"gorm.io/datatypes"
)

// Snapshot stores a complete point-in-time copy of all CMS content.
type Snapshot struct {
	ID          uint              `json:"id"          gorm:"primaryKey"`
	Name        string            `json:"name"        gorm:"type:varchar(200);not null"`
	Description string            `json:"description" gorm:"type:text"`
	Data        datatypes.JSONMap `json:"data"        gorm:"type:jsonb;not null"`
	CreatedAt   time.Time         `json:"created_at"  gorm:"autoCreateTime"`
	UpdatedAt   time.Time         `json:"updated_at"  gorm:"autoUpdateTime"`
}

// TableName specifies the table name for Snapshot
func (Snapshot) TableName() string {
	return "snapshots"
}

// SnapshotRequest is the body for POST /api/admin/snapshots
type SnapshotRequest struct {
	Name        string `json:"name"        validate:"required,min=1,max=200"`
	Description string `json:"description" validate:"omitempty,max=2000"`
}

// ImportSnapshotRequest wraps an uploaded JSON blob
type ImportSnapshotRequest struct {
	Name        string                 `json:"name"        validate:"required,min=1,max=200"`
	Description string                 `json:"description" validate:"omitempty"`
	Data        map[string]interface{} `json:"data"        validate:"required"`
}
