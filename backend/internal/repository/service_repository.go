package repository

import (
	"github.com/usmonbek/dentist-backend/internal/models"

	"gorm.io/gorm"
)

// ServiceRepository handles database operations for services
type ServiceRepository struct {
	db *gorm.DB
}

// NewServiceRepository creates a new ServiceRepository
func NewServiceRepository(db *gorm.DB) *ServiceRepository {
	return &ServiceRepository{db: db}
}

// FindAll returns all services ordered by display_order
func (r *ServiceRepository) FindAll() ([]models.Service, error) {
	var services []models.Service
	err := r.db.Order("display_order ASC").Find(&services).Error
	return services, err
}

// FindActive returns only active services ordered by display_order
func (r *ServiceRepository) FindActive() ([]models.Service, error) {
	var services []models.Service
	err := r.db.Where("active = ?", true).Order("display_order ASC").Find(&services).Error
	return services, err
}

// FindByID finds a service by ID
func (r *ServiceRepository) FindByID(id uint) (*models.Service, error) {
	var service models.Service
	err := r.db.First(&service, id).Error
	if err != nil {
		return nil, err
	}
	return &service, nil
}

// Create creates a new service
func (r *ServiceRepository) Create(service *models.Service) error {
	return r.db.Create(service).Error
}

// Update updates a service
func (r *ServiceRepository) Update(service *models.Service) error {
	return r.db.Save(service).Error
}

// Delete deletes a service by ID
func (r *ServiceRepository) Delete(id uint) error {
	return r.db.Delete(&models.Service{}, id).Error
}

// UpdateOrder updates the display_order of a service
func (r *ServiceRepository) UpdateOrder(id uint, order int) error {
	return r.db.Model(&models.Service{}).Where("id = ?", id).Update("display_order", order).Error
}

// GetMaxOrder returns the maximum display_order value
func (r *ServiceRepository) GetMaxOrder() (int, error) {
	var maxOrder int
	err := r.db.Model(&models.Service{}).Select("COALESCE(MAX(display_order), 0)").Scan(&maxOrder).Error
	return maxOrder, err
}
