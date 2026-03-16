package repository

import (
	"github.com/usmonbek/dentist-backend/internal/models"

	"gorm.io/gorm"
)

// GalleryRepository handles database operations for gallery images
type GalleryRepository struct {
	db *gorm.DB
}

// NewGalleryRepository creates a new GalleryRepository
func NewGalleryRepository(db *gorm.DB) *GalleryRepository {
	return &GalleryRepository{db: db}
}

// FindAll returns all gallery images ordered by display_order
func (r *GalleryRepository) FindAll() ([]models.GalleryImage, error) {
	var images []models.GalleryImage
	err := r.db.Order("display_order ASC").Find(&images).Error
	return images, err
}

// FindActive returns only active gallery images ordered by display_order
func (r *GalleryRepository) FindActive() ([]models.GalleryImage, error) {
	var images []models.GalleryImage
	err := r.db.Where("active = ?", true).Order("display_order ASC").Find(&images).Error
	return images, err
}

// FindActiveByCategory returns active gallery images filtered by category
func (r *GalleryRepository) FindActiveByCategory(category string) ([]models.GalleryImage, error) {
	var images []models.GalleryImage
	err := r.db.Where("active = ? AND category = ?", true, category).Order("display_order ASC").Find(&images).Error
	return images, err
}

// FindByID finds a gallery image by ID
func (r *GalleryRepository) FindByID(id uint) (*models.GalleryImage, error) {
	var image models.GalleryImage
	err := r.db.First(&image, id).Error
	if err != nil {
		return nil, err
	}
	return &image, nil
}

// Create creates a new gallery image
func (r *GalleryRepository) Create(image *models.GalleryImage) error {
	return r.db.Create(image).Error
}

// Update updates a gallery image
func (r *GalleryRepository) Update(image *models.GalleryImage) error {
	return r.db.Save(image).Error
}

// Delete deletes a gallery image by ID
func (r *GalleryRepository) Delete(id uint) error {
	return r.db.Delete(&models.GalleryImage{}, id).Error
}

// UpdateOrder updates the display_order of a gallery image
func (r *GalleryRepository) UpdateOrder(id uint, order int) error {
	return r.db.Model(&models.GalleryImage{}).Where("id = ?", id).Update("display_order", order).Error
}

// GetMaxOrder returns the maximum display_order value
func (r *GalleryRepository) GetMaxOrder() (int, error) {
	var maxOrder int
	err := r.db.Model(&models.GalleryImage{}).Select("COALESCE(MAX(display_order), 0)").Scan(&maxOrder).Error
	return maxOrder, err
}

// ExtractGalleryImageTranslation returns gallery image fields in specified language
func ExtractGalleryImageTranslation(image models.GalleryImage, lang string) map[string]interface{} {
	result := map[string]interface{}{
		"id":            image.ID,
		"filename":      image.Filename,
		"category":      image.Category,
		"tags":          image.Tags,
		"display_order": image.DisplayOrder,
		"active":        image.Active,
		"created_at":    image.CreatedAt,
		"updated_at":    image.UpdatedAt,
	}

	// Extract alt_text
	if altTextMap, ok := image.Translations["alt_text"].(map[string]interface{}); ok {
		if val, exists := altTextMap[lang]; exists && val != nil {
			result["alt_text"] = val
		} else if val, exists := altTextMap["uz"]; exists && val != nil {
			result["alt_text"] = val
		}
	}

	// Fallback to original column if translation not found
	if result["alt_text"] == nil {
		result["alt_text"] = image.AltText
	}

	return result
}

// ExtractGalleryImagesTranslation returns multiple gallery images translated to specified language
func ExtractGalleryImagesTranslation(images []models.GalleryImage, lang string) []map[string]interface{} {
	result := make([]map[string]interface{}, len(images))
	for i, image := range images {
		result[i] = ExtractGalleryImageTranslation(image, lang)
	}
	return result
}
