package repository

import (
	"fmt"

	"github.com/usmonbek/dentist-backend/internal/models"

	"gorm.io/gorm"
)

// SettingsRepository handles database operations for site settings and content
type SettingsRepository struct {
	db *gorm.DB
}

// NewSettingsRepository creates a new SettingsRepository
func NewSettingsRepository(db *gorm.DB) *SettingsRepository {
	return &SettingsRepository{db: db}
}

// === Site Settings ===

// GetAllSettings returns all site settings
func (r *SettingsRepository) GetAllSettings() ([]models.SiteSetting, error) {
	var settings []models.SiteSetting
	err := r.db.Order("key ASC").Find(&settings).Error
	return settings, err
}

// GetSettingsMap returns all site settings as a key-value map
func (r *SettingsRepository) GetSettingsMap() (models.SettingsMap, error) {
	settings, err := r.GetAllSettings()
	if err != nil {
		return nil, err
	}

	result := make(models.SettingsMap)
	for _, s := range settings {
		result[s.Key] = s.Value
	}
	return result, nil
}

// GetSettingsMapByLang returns settings translated to specified language
func (r *SettingsRepository) GetSettingsMapByLang(lang string) (models.SettingsMap, error) {
	settings, err := r.GetAllSettings()
	if err != nil {
		return nil, err
	}

	result := make(models.SettingsMap)
	for _, s := range settings {
		// Try to extract translation for requested language
		if val, exists := s.Translations[lang]; exists && val != nil && fmt.Sprintf("%v", val) != "" {
			result[s.Key] = fmt.Sprintf("%v", val)
			continue
		}
		// Fallback to Uzbek
		if val, exists := s.Translations["uz"]; exists && val != nil && fmt.Sprintf("%v", val) != "" {
			result[s.Key] = fmt.Sprintf("%v", val)
			continue
		}
		// Fallback to value column
		result[s.Key] = s.Value
	}
	return result, nil
}

// GetSetting returns a single setting by key
func (r *SettingsRepository) GetSetting(key string) (*models.SiteSetting, error) {
	var setting models.SiteSetting
	err := r.db.Where("key = ?", key).First(&setting).Error
	if err != nil {
		return nil, err
	}
	return &setting, nil
}

// UpdateSetting updates a setting value by key
func (r *SettingsRepository) UpdateSetting(key string, value string) error {
	return r.db.Model(&models.SiteSetting{}).Where("key = ?", key).Update("value", value).Error
}

// UpdateSettings updates multiple settings at once
func (r *SettingsRepository) UpdateSettings(settings map[string]string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for key, value := range settings {
			if err := tx.Model(&models.SiteSetting{}).Where("key = ?", key).Update("value", value).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

// === Site Content ===

// GetAllContent returns all site content
func (r *SettingsRepository) GetAllContent() ([]models.SiteContent, error) {
	var content []models.SiteContent
	err := r.db.Order("section ASC, key ASC").Find(&content).Error
	return content, err
}

// GetContentBySection returns all content for a specific section
func (r *SettingsRepository) GetContentBySection(section string) ([]models.SiteContent, error) {
	var content []models.SiteContent
	err := r.db.Where("section = ?", section).Order("key ASC").Find(&content).Error
	return content, err
}

// GetContentMap returns content for a section as a key-value map
func (r *SettingsRepository) GetContentMap(section string) (models.ContentMap, error) {
	content, err := r.GetContentBySection(section)
	if err != nil {
		return nil, err
	}

	result := make(models.ContentMap)
	for _, c := range content {
		result[c.Key] = c.Value
	}
	return result, nil
}

// GetContentMapByLang returns content for a section translated to specified language
func (r *SettingsRepository) GetContentMapByLang(section, lang string) (models.ContentMap, error) {
	content, err := r.GetContentBySection(section)
	if err != nil {
		return nil, err
	}

	result := make(models.ContentMap)
	for _, c := range content {
		// Try to extract translation for requested language
		if val, exists := c.Translations[lang]; exists && val != nil && fmt.Sprintf("%v", val) != "" {
			result[c.Key] = fmt.Sprintf("%v", val)
			continue
		}
		// Fallback to Uzbek
		if val, exists := c.Translations["uz"]; exists && val != nil && fmt.Sprintf("%v", val) != "" {
			result[c.Key] = fmt.Sprintf("%v", val)
			continue
		}
		// Fallback to value column
		result[c.Key] = c.Value
	}
	return result, nil
}

// GetContent returns a single content item by section and key
func (r *SettingsRepository) GetContent(section, key string) (*models.SiteContent, error) {
	var content models.SiteContent
	err := r.db.Where("section = ? AND key = ?", section, key).First(&content).Error
	if err != nil {
		return nil, err
	}
	return &content, nil
}

// UpdateContent updates a content value by section and key
func (r *SettingsRepository) UpdateContent(section, key, value string) error {
	return r.db.Model(&models.SiteContent{}).Where("section = ? AND key = ?", section, key).Update("value", value).Error
}

// UpdateContentSection updates multiple content items for a section
func (r *SettingsRepository) UpdateContentSection(section string, content map[string]string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for key, value := range content {
			if err := tx.Model(&models.SiteContent{}).Where("section = ? AND key = ?", section, key).Update("value", value).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

// CreateContent creates a new content item
func (r *SettingsRepository) CreateContent(content *models.SiteContent) error {
	return r.db.Create(content).Error
}

// DeleteContent deletes a content item by section and key
func (r *SettingsRepository) DeleteContent(section, key string) error {
	return r.db.Where("section = ? AND key = ?", section, key).Delete(&models.SiteContent{}).Error
}
