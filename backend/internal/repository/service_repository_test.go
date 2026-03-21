package repository

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/usmonbek/dentist-backend/internal/models"
	"gorm.io/datatypes"
)

func makeServiceWithTranslations(titleUz, titleRu, titleEn, descUz, descRu, descEn string) models.Service {
	return models.Service{
		ID:           1,
		Title:        "Base Title",
		Description:  "Base Description",
		Icon:         "FaTooth",
		DisplayOrder: 1,
		Active:       true,
		Translations: datatypes.JSONMap{
			"title": map[string]interface{}{
				"uz": titleUz,
				"ru": titleRu,
				"en": titleEn,
			},
			"description": map[string]interface{}{
				"uz": descUz,
				"ru": descRu,
				"en": descEn,
			},
		},
	}
}

func TestExtractServiceTranslation_RequestedLang(t *testing.T) {
	svc := makeServiceWithTranslations("Tish", "Зубы", "Teeth", "Tavsif uz", "Описание ru", "Description en")

	result := ExtractServiceTranslation(svc, "ru")
	assert.Equal(t, "Зубы", result["title"])
	assert.Equal(t, "Описание ru", result["description"])
}

func TestExtractServiceTranslation_FallbackToUz(t *testing.T) {
	// English not set — should fall back to uz
	svc := makeServiceWithTranslations("Tish", "Зубы", "", "Tavsif uz", "Описание ru", "")

	result := ExtractServiceTranslation(svc, "en")
	assert.Equal(t, "Tish", result["title"])
	assert.Equal(t, "Tavsif uz", result["description"])
}

func TestExtractServiceTranslation_FallbackToBaseColumn(t *testing.T) {
	// No translations at all — fall back to base Title/Description
	svc := models.Service{
		ID:           2,
		Title:        "Base Title",
		Description:  "Base Description",
		Icon:         "FaTooth",
		DisplayOrder: 1,
		Active:       true,
		Translations: datatypes.JSONMap{},
	}

	result := ExtractServiceTranslation(svc, "uz")
	assert.Equal(t, "Base Title", result["title"])
	assert.Equal(t, "Base Description", result["description"])
}

func TestExtractServiceTranslation_PreservesNonTranslatableFields(t *testing.T) {
	svc := makeServiceWithTranslations("Tish", "Зубы", "Teeth", "Tavsif", "Описание", "Description")
	svc.ID = 42
	svc.Icon = "FaSmile"
	svc.DisplayOrder = 5
	svc.Active = false

	result := ExtractServiceTranslation(svc, "uz")
	assert.Equal(t, uint(42), result["id"])
	assert.Equal(t, "FaSmile", result["icon"])
	assert.Equal(t, 5, result["display_order"])
	assert.Equal(t, false, result["active"])
}

func TestExtractServicesTranslation_MultipleServices(t *testing.T) {
	services := []models.Service{
		makeServiceWithTranslations("Tish1", "Зубы1", "Teeth1", "Desc1 uz", "Desc1 ru", "Desc1 en"),
		makeServiceWithTranslations("Tish2", "Зубы2", "Teeth2", "Desc2 uz", "Desc2 ru", "Desc2 en"),
		makeServiceWithTranslations("Tish3", "Зубы3", "Teeth3", "Desc3 uz", "Desc3 ru", "Desc3 en"),
	}

	results := ExtractServicesTranslation(services, "ru")
	assert.Len(t, results, 3)
	assert.Equal(t, "Зубы1", results[0]["title"])
	assert.Equal(t, "Зубы2", results[1]["title"])
	assert.Equal(t, "Зубы3", results[2]["title"])
}

func TestExtractServicesTranslation_EmptySlice(t *testing.T) {
	results := ExtractServicesTranslation([]models.Service{}, "uz")
	assert.Len(t, results, 0)
}

func TestExtractServiceTranslation_UzLang(t *testing.T) {
	svc := makeServiceWithTranslations("Tish", "Зубы", "Teeth", "Tavsif", "Описание", "Description")

	result := ExtractServiceTranslation(svc, "uz")
	assert.Equal(t, "Tish", result["title"])
	assert.Equal(t, "Tavsif", result["description"])
}
