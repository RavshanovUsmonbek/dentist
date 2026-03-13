package repository

import (
	"github.com/usmonbek/dentist-backend/internal/models"

	"gorm.io/gorm"
)

// TestimonialRepository handles database operations for testimonials
type TestimonialRepository struct {
	db *gorm.DB
}

// NewTestimonialRepository creates a new TestimonialRepository
func NewTestimonialRepository(db *gorm.DB) *TestimonialRepository {
	return &TestimonialRepository{db: db}
}

// FindAll returns all testimonials ordered by display_order
func (r *TestimonialRepository) FindAll() ([]models.Testimonial, error) {
	var testimonials []models.Testimonial
	err := r.db.Order("display_order ASC").Find(&testimonials).Error
	return testimonials, err
}

// FindActive returns only active testimonials ordered by display_order
func (r *TestimonialRepository) FindActive() ([]models.Testimonial, error) {
	var testimonials []models.Testimonial
	err := r.db.Where("active = ?", true).Order("display_order ASC").Find(&testimonials).Error
	return testimonials, err
}

// FindByID finds a testimonial by ID
func (r *TestimonialRepository) FindByID(id uint) (*models.Testimonial, error) {
	var testimonial models.Testimonial
	err := r.db.First(&testimonial, id).Error
	if err != nil {
		return nil, err
	}
	return &testimonial, nil
}

// Create creates a new testimonial
func (r *TestimonialRepository) Create(testimonial *models.Testimonial) error {
	return r.db.Create(testimonial).Error
}

// Update updates a testimonial
func (r *TestimonialRepository) Update(testimonial *models.Testimonial) error {
	return r.db.Save(testimonial).Error
}

// Delete deletes a testimonial by ID
func (r *TestimonialRepository) Delete(id uint) error {
	return r.db.Delete(&models.Testimonial{}, id).Error
}

// UpdateOrder updates the display_order of a testimonial
func (r *TestimonialRepository) UpdateOrder(id uint, order int) error {
	return r.db.Model(&models.Testimonial{}).Where("id = ?", id).Update("display_order", order).Error
}

// GetMaxOrder returns the maximum display_order value
func (r *TestimonialRepository) GetMaxOrder() (int, error) {
	var maxOrder int
	err := r.db.Model(&models.Testimonial{}).Select("COALESCE(MAX(display_order), 0)").Scan(&maxOrder).Error
	return maxOrder, err
}
