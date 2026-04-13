package repository

import (
	"encoding/json"
	"fmt"

	"github.com/usmonbek/dentist-backend/internal/models"

	"gorm.io/datatypes"
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

// SecretSettingKeys is the canonical set of site_settings keys whose values
// must never appear in cleartext outside the server — not in API responses,
// not in snapshot blobs, and not in export files.
var SecretSettingKeys = map[string]bool{
	"telegram_bot_token": true,
	"telegram_chat_id":   true,
}

// jsonValToString converts a JSONB translation value to a string.
// For plain strings it returns the string directly.
// For arrays/objects it returns JSON-encoded string so callers get valid JSON.
func jsonValToString(val interface{}) string {
	if val == nil {
		return ""
	}
	switch v := val.(type) {
	case string:
		return v
	default:
		b, err := json.Marshal(v)
		if err != nil {
			return fmt.Sprintf("%v", v)
		}
		return string(b)
	}
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
		if val, exists := s.Translations[lang]; exists && val != nil && jsonValToString(val) != "" {
			result[s.Key] = jsonValToString(val)
			continue
		}
		// Fallback to Uzbek
		if val, exists := s.Translations["uz"]; exists && val != nil && jsonValToString(val) != "" {
			result[s.Key] = jsonValToString(val)
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

// GetSettingValue returns the value of a setting by key, or "" if not found.
// Satisfies the services.SettingsGetter interface.
func (r *SettingsRepository) GetSettingValue(key string) string {
	s, err := r.GetSetting(key)
	if err != nil || s == nil {
		return ""
	}
	return s.Value
}

// UpdateSetting updates a setting value by key
func (r *SettingsRepository) UpdateSetting(key string, value string) error {
	return r.db.Model(&models.SiteSetting{}).Where("key = ?", key).Update("value", value).Error
}

// UpdateSettings updates multiple settings at once
func (r *SettingsRepository) UpdateSettings(settings map[string]string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for key, value := range settings {
			// Update value column and also update the 'uz' translation so that
			// GetSettingsMapByLang returns the new value (translations take priority over value).
			err := tx.Exec(
				`UPDATE site_settings SET value = ?, translations = translations || jsonb_build_object('uz', ?::text) WHERE key = ?`,
				value, value, key,
			).Error
			if err != nil {
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
		if val, exists := c.Translations[lang]; exists && val != nil && jsonValToString(val) != "" {
			result[c.Key] = jsonValToString(val)
			continue
		}
		// Fallback to Uzbek
		if val, exists := c.Translations["uz"]; exists && val != nil && jsonValToString(val) != "" {
			result[c.Key] = jsonValToString(val)
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
			// Upsert: create the row if it doesn't exist yet, otherwise update.
			// Also mirror the value into the 'uz' translation so GetContentMapByLang
			// returns the new value (translations take priority over the value column).
			err := tx.Exec(
				`INSERT INTO site_content (section, key, value, translations, updated_at)
				 VALUES (?, ?, ?, jsonb_build_object('uz', ?::text), NOW())
				 ON CONFLICT (section, key) DO UPDATE
				   SET value = EXCLUDED.value,
				       translations = site_content.translations || jsonb_build_object('uz', ?::text),
				       updated_at = NOW()`,
				section, key, value, value, value,
			).Error
			if err != nil {
				return err
			}
		}
		return nil
	})
}

// UpdateContentSectionTranslations updates multiple content items with per-language translations.
// Rows are upserted so new keys (e.g. stats fields) are created automatically on first save.
func (r *SettingsRepository) UpdateContentSectionTranslations(section string, content map[string]map[string]string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for key, langValues := range content {
			// Use uz value as the canonical value column
			baseValue := langValues["uz"]
			translations := make(datatypes.JSONMap)
			for lang, val := range langValues {
				translations[lang] = val
			}
			translationsJSON, err := json.Marshal(translations)
			if err != nil {
				return err
			}
			if err := tx.Exec(
				`INSERT INTO site_content (section, key, value, translations, updated_at)
				 VALUES (?, ?, ?, ?::jsonb, NOW())
				 ON CONFLICT (section, key) DO UPDATE
				   SET value        = EXCLUDED.value,
				       translations = EXCLUDED.translations,
				       updated_at   = NOW()`,
				section, key, baseValue, string(translationsJSON),
			).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

// UpdateSettingsTranslations updates multiple settings with per-language translations
func (r *SettingsRepository) UpdateSettingsTranslations(settings map[string]map[string]string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for key, langValues := range settings {
			baseValue := langValues["uz"]
			translations := make(datatypes.JSONMap)
			for lang, val := range langValues {
				translations[lang] = val
			}
			if err := tx.Model(&models.SiteSetting{}).
				Where("key = ?", key).
				Updates(map[string]interface{}{
					"value":        baseValue,
					"translations": translations,
				}).Error; err != nil {
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
