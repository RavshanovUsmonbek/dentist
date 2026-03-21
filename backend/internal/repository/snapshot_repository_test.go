package repository

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func makeValidSnapshotData() map[string]interface{} {
	return map[string]interface{}{
		"version":           "1",
		"services":          []interface{}{},
		"testimonials":      []interface{}{},
		"gallery_categories": []interface{}{},
		"gallery_images":    []interface{}{},
		"locations":         []interface{}{},
		"site_settings":     []interface{}{},
		"site_content":      []interface{}{},
	}
}

func TestValidateSnapshotData_Valid(t *testing.T) {
	data := makeValidSnapshotData()
	err := ValidateSnapshotData(data)
	require.NoError(t, err)
}

func TestValidateSnapshotData_MissingVersion(t *testing.T) {
	data := makeValidSnapshotData()
	delete(data, "version")
	err := ValidateSnapshotData(data)
	assert.Error(t, err)
}

func TestValidateSnapshotData_WrongVersion(t *testing.T) {
	data := makeValidSnapshotData()
	data["version"] = "2"
	err := ValidateSnapshotData(data)
	assert.Error(t, err)
}

func TestValidateSnapshotData_MissingServices(t *testing.T) {
	data := makeValidSnapshotData()
	delete(data, "services")
	err := ValidateSnapshotData(data)
	assert.Error(t, err)
}

func TestValidateSnapshotData_MissingTestimonials(t *testing.T) {
	data := makeValidSnapshotData()
	delete(data, "testimonials")
	err := ValidateSnapshotData(data)
	assert.Error(t, err)
}

func TestValidateSnapshotData_MissingGalleryImages(t *testing.T) {
	data := makeValidSnapshotData()
	delete(data, "gallery_images")
	err := ValidateSnapshotData(data)
	assert.Error(t, err)
}

func TestValidateSnapshotData_MissingLocations(t *testing.T) {
	data := makeValidSnapshotData()
	delete(data, "locations")
	err := ValidateSnapshotData(data)
	assert.Error(t, err)
}

func TestValidateSnapshotData_MissingSiteSettings(t *testing.T) {
	data := makeValidSnapshotData()
	delete(data, "site_settings")
	err := ValidateSnapshotData(data)
	assert.Error(t, err)
}

func TestValidateSnapshotData_EmptyArraysOK(t *testing.T) {
	// All keys present but with empty arrays — still valid
	data := makeValidSnapshotData()
	err := ValidateSnapshotData(data)
	assert.NoError(t, err)
}

func TestValidateSnapshotData_WithActualData(t *testing.T) {
	data := makeValidSnapshotData()
	data["services"] = []interface{}{
		map[string]interface{}{"id": 1, "title": "Tish"},
	}
	data["testimonials"] = []interface{}{
		map[string]interface{}{"id": 1, "name": "Alice"},
	}
	err := ValidateSnapshotData(data)
	assert.NoError(t, err)
}
