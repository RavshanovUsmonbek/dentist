package repository

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/usmonbek/dentist-backend/internal/models"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// SnapshotRepository handles database operations for snapshots
type SnapshotRepository struct {
	db *gorm.DB
}

// NewSnapshotRepository creates a new SnapshotRepository
func NewSnapshotRepository(db *gorm.DB) *SnapshotRepository {
	return &SnapshotRepository{db: db}
}

// SnapshotMeta is a lightweight projection used for list view (excludes the large data blob)
type SnapshotMeta struct {
	ID          uint      `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// FindAll returns all snapshots ordered newest first, without the data blob
func (r *SnapshotRepository) FindAll() ([]SnapshotMeta, error) {
	var rows []SnapshotMeta
	err := r.db.Table("snapshots").
		Select("id, name, description, created_at, updated_at").
		Order("created_at DESC").
		Scan(&rows).Error
	return rows, err
}

// FindByID returns a single snapshot including its data blob
func (r *SnapshotRepository) FindByID(id uint) (*models.Snapshot, error) {
	var s models.Snapshot
	err := r.db.First(&s, id).Error
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// Create saves a new snapshot row
func (r *SnapshotRepository) Create(s *models.Snapshot) error {
	return r.db.Create(s).Error
}

// Delete removes a snapshot by ID
func (r *SnapshotRepository) Delete(id uint) error {
	return r.db.Delete(&models.Snapshot{}, id).Error
}

// CaptureData gathers all 7 entity sets from the DB and returns them as a JSONMap
func (r *SnapshotRepository) CaptureData(
	serviceRepo     *ServiceRepository,
	testimonialRepo *TestimonialRepository,
	galleryRepo     *GalleryRepository,
	galleryCatRepo  *GalleryCategoryRepository,
	locationRepo    *LocationRepository,
	settingsRepo    *SettingsRepository,
) (datatypes.JSONMap, error) {

	services, err := serviceRepo.FindAll()
	if err != nil {
		return nil, fmt.Errorf("services: %w", err)
	}

	testimonials, err := testimonialRepo.FindAll()
	if err != nil {
		return nil, fmt.Errorf("testimonials: %w", err)
	}

	gallery, err := galleryRepo.FindAll()
	if err != nil {
		return nil, fmt.Errorf("gallery: %w", err)
	}

	categories, err := galleryCatRepo.FindAll()
	if err != nil {
		return nil, fmt.Errorf("gallery_categories: %w", err)
	}

	locations, err := locationRepo.FindAll()
	if err != nil {
		return nil, fmt.Errorf("locations: %w", err)
	}

	siteSettings, err := settingsRepo.GetAllSettings()
	if err != nil {
		return nil, fmt.Errorf("site_settings: %w", err)
	}

	siteContent, err := settingsRepo.GetAllContent()
	if err != nil {
		return nil, fmt.Errorf("site_content: %w", err)
	}

	raw := map[string]interface{}{
		"version":           "1",
		"snapshotted_at":    time.Now().UTC().Format(time.RFC3339),
		"services":          services,
		"testimonials":      testimonials,
		"gallery_categories": categories,
		"gallery_images":    gallery,
		"locations":         locations,
		"site_settings":     siteSettings,
		"site_content":      siteContent,
	}

	// Round-trip through JSON to get a plain map[string]interface{}
	b, err := json.Marshal(raw)
	if err != nil {
		return nil, err
	}
	var result datatypes.JSONMap
	err = json.Unmarshal(b, &result)
	return result, err
}

// RestoreData wipes and recreates all 7 entity types inside a single transaction
func (r *SnapshotRepository) RestoreData(data datatypes.JSONMap) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Delete all existing rows
		tables := []string{
			"gallery_images", "gallery_categories",
			"services", "testimonials", "locations",
			"site_content", "site_settings",
		}
		for _, t := range tables {
			if err := tx.Exec("DELETE FROM " + t).Error; err != nil {
				return fmt.Errorf("clearing %s: %w", t, err)
			}
		}

		// Marshal data back to JSON for typed re-parsing
		b, err := json.Marshal(data)
		if err != nil {
			return err
		}

		var payload struct {
			Services          []models.Service         `json:"services"`
			Testimonials      []models.Testimonial     `json:"testimonials"`
			GalleryCategories []models.GalleryCategory `json:"gallery_categories"`
			GalleryImages     []models.GalleryImage    `json:"gallery_images"`
			Locations         []models.Location        `json:"locations"`
			SiteSettings      []models.SiteSetting     `json:"site_settings"`
			SiteContent       []models.SiteContent     `json:"site_content"`
		}
		if err := json.Unmarshal(b, &payload); err != nil {
			return fmt.Errorf("parsing snapshot data: %w", err)
		}

		// Re-insert in dependency order
		if len(payload.GalleryCategories) > 0 {
			if err := tx.CreateInBatches(payload.GalleryCategories, 100).Error; err != nil {
				return fmt.Errorf("inserting gallery_categories: %w", err)
			}
		}
		if len(payload.Services) > 0 {
			if err := tx.CreateInBatches(payload.Services, 100).Error; err != nil {
				return fmt.Errorf("inserting services: %w", err)
			}
		}
		if len(payload.Testimonials) > 0 {
			if err := tx.CreateInBatches(payload.Testimonials, 100).Error; err != nil {
				return fmt.Errorf("inserting testimonials: %w", err)
			}
		}
		if len(payload.GalleryImages) > 0 {
			if err := tx.CreateInBatches(payload.GalleryImages, 100).Error; err != nil {
				return fmt.Errorf("inserting gallery_images: %w", err)
			}
		}
		if len(payload.Locations) > 0 {
			if err := tx.CreateInBatches(payload.Locations, 100).Error; err != nil {
				return fmt.Errorf("inserting locations: %w", err)
			}
		}
		if len(payload.SiteSettings) > 0 {
			if err := tx.CreateInBatches(payload.SiteSettings, 100).Error; err != nil {
				return fmt.Errorf("inserting site_settings: %w", err)
			}
		}
		if len(payload.SiteContent) > 0 {
			if err := tx.CreateInBatches(payload.SiteContent, 100).Error; err != nil {
				return fmt.Errorf("inserting site_content: %w", err)
			}
		}

		// Reset SERIAL sequences so next auto-generated IDs don't collide
		seqResets := []string{
			"SELECT setval('services_id_seq',            (SELECT COALESCE(MAX(id),0) FROM services)            + 1, false)",
			"SELECT setval('testimonials_id_seq',        (SELECT COALESCE(MAX(id),0) FROM testimonials)        + 1, false)",
			"SELECT setval('gallery_categories_id_seq',  (SELECT COALESCE(MAX(id),0) FROM gallery_categories)  + 1, false)",
			"SELECT setval('gallery_images_id_seq',      (SELECT COALESCE(MAX(id),0) FROM gallery_images)      + 1, false)",
			"SELECT setval('locations_id_seq',           (SELECT COALESCE(MAX(id),0) FROM locations)           + 1, false)",
			"SELECT setval('site_settings_id_seq',       (SELECT COALESCE(MAX(id),0) FROM site_settings)       + 1, false)",
			"SELECT setval('site_content_id_seq',        (SELECT COALESCE(MAX(id),0) FROM site_content)        + 1, false)",
		}
		for _, q := range seqResets {
			if err := tx.Exec(q).Error; err != nil {
				return fmt.Errorf("resetting sequence: %w", err)
			}
		}
		return nil
	})
}

// ValidateSnapshotData checks that the data blob has the required structure
func ValidateSnapshotData(data map[string]interface{}) error {
	ver, ok := data["version"]
	if !ok || fmt.Sprintf("%v", ver) != "1" {
		return fmt.Errorf("invalid or missing version field (must be \"1\")")
	}
	required := []string{
		"services", "testimonials", "gallery_categories",
		"gallery_images", "locations", "site_settings", "site_content",
	}
	for _, key := range required {
		if _, ok := data[key]; !ok {
			return fmt.Errorf("missing required key: %s", key)
		}
	}
	return nil
}
