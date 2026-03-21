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

// ExtractServiceTranslation returns service fields in specified language
func ExtractServiceTranslation(service models.Service, lang string) map[string]interface{} {
	result := map[string]interface{}{
		"id":            service.ID,
		"icon":          service.Icon,
		"display_order": service.DisplayOrder,
		"active":        service.Active,
		"created_at":    service.CreatedAt,
		"updated_at":    service.UpdatedAt,
	}

	// Extract title
	if titleMap, ok := service.Translations["title"].(map[string]interface{}); ok {
		if val, exists := titleMap[lang]; exists && val != nil && val != "" {
			result["title"] = val
		} else if val, exists := titleMap["uz"]; exists && val != nil && val != "" {
			result["title"] = val
		}
	}

	// Extract description
	if descMap, ok := service.Translations["description"].(map[string]interface{}); ok {
		if val, exists := descMap[lang]; exists && val != nil && val != "" {
			result["description"] = val
		} else if val, exists := descMap["uz"]; exists && val != nil && val != "" {
			result["description"] = val
		}
	}

	// Fallback to original columns if translation not found
	if result["title"] == nil {
		result["title"] = service.Title
	}
	if result["description"] == nil {
		result["description"] = service.Description
	}

	return result
}

// ExtractServicesTranslation returns multiple services translated to specified language
func ExtractServicesTranslation(services []models.Service, lang string) []map[string]interface{} {
	result := make([]map[string]interface{}, len(services))
	for i, service := range services {
		result[i] = ExtractServiceTranslation(service, lang)
	}
	return result
}
