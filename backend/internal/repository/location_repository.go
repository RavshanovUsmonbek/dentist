package repository

import (
	"github.com/usmonbek/dentist-backend/internal/models"

	"gorm.io/gorm"
)

// LocationRepository handles database operations for locations
type LocationRepository struct {
	db *gorm.DB
}

// NewLocationRepository creates a new LocationRepository
func NewLocationRepository(db *gorm.DB) *LocationRepository {
	return &LocationRepository{db: db}
}

// FindAll returns all locations ordered by display_order
func (r *LocationRepository) FindAll() ([]models.Location, error) {
	var locations []models.Location
	err := r.db.Order("display_order ASC").Find(&locations).Error
	return locations, err
}

// FindActive returns only active locations ordered by display_order
func (r *LocationRepository) FindActive() ([]models.Location, error) {
	var locations []models.Location
	err := r.db.Where("active = ?", true).Order("display_order ASC").Find(&locations).Error
	return locations, err
}

// FindByID finds a location by ID
func (r *LocationRepository) FindByID(id uint) (*models.Location, error) {
	var location models.Location
	err := r.db.First(&location, id).Error
	if err != nil {
		return nil, err
	}
	return &location, nil
}

// Create creates a new location
func (r *LocationRepository) Create(location *models.Location) error {
	return r.db.Create(location).Error
}

// Update updates a location
func (r *LocationRepository) Update(location *models.Location) error {
	return r.db.Save(location).Error
}

// Delete deletes a location by ID
func (r *LocationRepository) Delete(id uint) error {
	return r.db.Delete(&models.Location{}, id).Error
}

// UpdateOrder updates the display_order of a location
func (r *LocationRepository) UpdateOrder(id uint, order int) error {
	return r.db.Model(&models.Location{}).Where("id = ?", id).Update("display_order", order).Error
}

// GetMaxOrder returns the maximum display_order value
func (r *LocationRepository) GetMaxOrder() (int, error) {
	var maxOrder int
	err := r.db.Model(&models.Location{}).Select("COALESCE(MAX(display_order), 0)").Scan(&maxOrder).Error
	return maxOrder, err
}

// ExtractLocationTranslation returns location fields in specified language
func ExtractLocationTranslation(location models.Location, lang string) map[string]interface{} {
	result := map[string]interface{}{
		"id":             location.ID,
		"business_hours": location.BusinessHours,
		"latitude":       location.Latitude,
		"longitude":      location.Longitude,
		"display_order":  location.DisplayOrder,
		"active":         location.Active,
		"created_at":     location.CreatedAt,
		"updated_at":     location.UpdatedAt,
	}

	// Extract name
	if nameMap, ok := location.Translations["name"].(map[string]interface{}); ok {
		if val, exists := nameMap[lang]; exists && val != nil {
			result["name"] = val
		} else if val, exists := nameMap["uz"]; exists && val != nil {
			result["name"] = val
		}
	}

	// Extract address
	if addressMap, ok := location.Translations["address"].(map[string]interface{}); ok {
		if val, exists := addressMap[lang]; exists && val != nil {
			result["address"] = val
		} else if val, exists := addressMap["uz"]; exists && val != nil {
			result["address"] = val
		}
	}

	// Fallback to original columns if translation not found
	if result["name"] == nil {
		result["name"] = location.Name
	}
	if result["address"] == nil {
		result["address"] = location.Address
	}

	return result
}

// ExtractLocationsTranslation returns multiple locations translated to specified language
func ExtractLocationsTranslation(locations []models.Location, lang string) []map[string]interface{} {
	result := make([]map[string]interface{}, len(locations))
	for i, location := range locations {
		result[i] = ExtractLocationTranslation(location, lang)
	}
	return result
}
