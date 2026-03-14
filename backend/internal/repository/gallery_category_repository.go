package repository

import (
	"github.com/usmonbek/dentist-backend/internal/models"
	"gorm.io/gorm"
)

// GalleryCategoryRepository handles database operations for gallery categories
type GalleryCategoryRepository struct {
	db *gorm.DB
}

// NewGalleryCategoryRepository creates a new gallery category repository
func NewGalleryCategoryRepository(db *gorm.DB) *GalleryCategoryRepository {
	return &GalleryCategoryRepository{db: db}
}

// FindAll retrieves all gallery categories ordered by display_order
func (r *GalleryCategoryRepository) FindAll() ([]models.GalleryCategory, error) {
	var categories []models.GalleryCategory
	err := r.db.Order("display_order ASC").Find(&categories).Error
	return categories, err
}

// FindEnabled retrieves all enabled gallery categories ordered by display_order
func (r *GalleryCategoryRepository) FindEnabled() ([]models.GalleryCategory, error) {
	var categories []models.GalleryCategory
	err := r.db.Where("enabled = ?", true).Order("display_order ASC").Find(&categories).Error
	return categories, err
}

// FindByID retrieves a gallery category by ID
func (r *GalleryCategoryRepository) FindByID(id uint) (*models.GalleryCategory, error) {
	var category models.GalleryCategory
	err := r.db.First(&category, id).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// FindBySlug retrieves a gallery category by slug
func (r *GalleryCategoryRepository) FindBySlug(slug string) (*models.GalleryCategory, error) {
	var category models.GalleryCategory
	err := r.db.Where("slug = ?", slug).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// Create creates a new gallery category
func (r *GalleryCategoryRepository) Create(category *models.GalleryCategory) error {
	return r.db.Create(category).Error
}

// Update updates an existing gallery category
func (r *GalleryCategoryRepository) Update(category *models.GalleryCategory) error {
	return r.db.Save(category).Error
}

// Delete deletes a gallery category
func (r *GalleryCategoryRepository) Delete(id uint) error {
	return r.db.Delete(&models.GalleryCategory{}, id).Error
}

// UpdateOrder updates the display_order of a gallery category
func (r *GalleryCategoryRepository) UpdateOrder(id uint, order int) error {
	return r.db.Model(&models.GalleryCategory{}).Where("id = ?", id).Update("display_order", order).Error
}

// GetMaxOrder returns the maximum display_order value
func (r *GalleryCategoryRepository) GetMaxOrder() (int, error) {
	var maxOrder int
	err := r.db.Model(&models.GalleryCategory{}).Select("COALESCE(MAX(display_order), 0)").Scan(&maxOrder).Error
	return maxOrder, err
}
