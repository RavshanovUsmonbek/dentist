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

// FindActive returns up to 9 approved+active testimonials, most recent first
func (r *TestimonialRepository) FindActive() ([]models.Testimonial, error) {
	var testimonials []models.Testimonial
	err := r.db.Where("active = ? AND status = ?", true, "approved").
		Order("created_at DESC").Limit(9).Find(&testimonials).Error
	return testimonials, err
}

// FindPending returns testimonials awaiting admin review
func (r *TestimonialRepository) FindPending() ([]models.Testimonial, error) {
	var testimonials []models.Testimonial
	err := r.db.Where("status = ?", "pending").Order("created_at ASC").Find(&testimonials).Error
	return testimonials, err
}

// UpdateStatus updates the status and active flag of a testimonial
func (r *TestimonialRepository) UpdateStatus(id uint, status string, active bool) error {
	return r.db.Model(&models.Testimonial{}).Where("id = ?", id).
		Updates(map[string]any{"status": status, "active": active}).Error
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

// CreateSubmission inserts a public testimonial submission, explicitly setting active=false.
// Cannot use Create() directly because GORM skips zero-value bool when a default is set.
func (r *TestimonialRepository) CreateSubmission(testimonial *models.Testimonial) error {
	return r.db.Exec(
		`INSERT INTO testimonials (name, initials, rating, text, active, status, display_order)
		 VALUES (?, ?, ?, ?, false, 'pending', 0)`,
		testimonial.Name, testimonial.Initials, testimonial.Rating, testimonial.Text,
	).Error
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
