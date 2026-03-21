package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/usmonbek/dentist-backend/internal/repository"
)

// AdminSettingsHandler handles admin settings and content endpoints
type AdminSettingsHandler struct {
	settingsRepo *repository.SettingsRepository
}

// NewAdminSettingsHandler creates a new AdminSettingsHandler
func NewAdminSettingsHandler(settingsRepo *repository.SettingsRepository) *AdminSettingsHandler {
	return &AdminSettingsHandler{
		settingsRepo: settingsRepo,
	}
}

// HandleSettings handles GET/PUT /api/admin/settings
func (h *AdminSettingsHandler) HandleSettings(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.getSettings(w, r)
	case http.MethodPut:
		h.updateSettings(w, r)
	default:
		sendMethodNotAllowed(w)
	}
}

func (h *AdminSettingsHandler) getSettings(w http.ResponseWriter, r *http.Request) {
	settings, err := h.settingsRepo.GetAllSettings()
	if err != nil {
		sendInternalError(w, "Failed to fetch settings")
		return
	}
	sendSuccess(w, settings)
}

func (h *AdminSettingsHandler) updateSettings(w http.ResponseWriter, r *http.Request) {
	var raw map[string]json.RawMessage
	if err := decodeJSON(r, &raw); err != nil {
		sendBadRequest(w, "Invalid request body")
		return
	}

	stringUpdates := make(map[string]string)
	translationUpdates := make(map[string]map[string]string)

	for key, val := range raw {
		// Try to unmarshal as map (multi-lang object)
		var langMap map[string]string
		if err := json.Unmarshal(val, &langMap); err == nil {
			translationUpdates[key] = langMap
		} else {
			// Plain string value
			var strVal string
			if err := json.Unmarshal(val, &strVal); err == nil {
				stringUpdates[key] = strVal
			}
		}
	}

	if len(stringUpdates) > 0 {
		if err := h.settingsRepo.UpdateSettings(stringUpdates); err != nil {
			sendInternalError(w, "Failed to update settings")
			return
		}
	}

	if len(translationUpdates) > 0 {
		if err := h.settingsRepo.UpdateSettingsTranslations(translationUpdates); err != nil {
			sendInternalError(w, "Failed to update settings translations")
			return
		}
	}

	sendSuccessMessage(w, "Settings updated successfully")
}

// HandleContent handles GET/PUT /api/admin/content/:section
func (h *AdminSettingsHandler) HandleContent(w http.ResponseWriter, r *http.Request) {
	// Extract section from path: /api/admin/content/hero -> hero
	section := extractSectionFromPath(r.URL.Path)
	if section == "" {
		sendBadRequest(w, "Section is required")
		return
	}

	switch r.Method {
	case http.MethodGet:
		h.getContent(w, r, section)
	case http.MethodPut:
		h.updateContent(w, r, section)
	default:
		sendMethodNotAllowed(w)
	}
}

func (h *AdminSettingsHandler) getContent(w http.ResponseWriter, r *http.Request, section string) {
	content, err := h.settingsRepo.GetContentBySection(section)
	if err != nil {
		sendInternalError(w, "Failed to fetch content")
		return
	}
	sendSuccess(w, content)
}

func (h *AdminSettingsHandler) updateContent(w http.ResponseWriter, r *http.Request, section string) {
	var raw map[string]json.RawMessage
	if err := decodeJSON(r, &raw); err != nil {
		sendBadRequest(w, "Invalid request body")
		return
	}

	stringUpdates := make(map[string]string)
	translationUpdates := make(map[string]map[string]string)

	for key, val := range raw {
		// Try to unmarshal as map (multi-lang object)
		var langMap map[string]string
		if err := json.Unmarshal(val, &langMap); err == nil {
			translationUpdates[key] = langMap
		} else {
			// Plain string value
			var strVal string
			if err := json.Unmarshal(val, &strVal); err == nil {
				stringUpdates[key] = strVal
			}
		}
	}

	if len(stringUpdates) > 0 {
		if err := h.settingsRepo.UpdateContentSection(section, stringUpdates); err != nil {
			sendInternalError(w, "Failed to update content")
			return
		}
	}

	if len(translationUpdates) > 0 {
		if err := h.settingsRepo.UpdateContentSectionTranslations(section, translationUpdates); err != nil {
			sendInternalError(w, "Failed to update content translations")
			return
		}
	}

	sendSuccessMessage(w, "Content updated successfully")
}

// HandleAllContent handles GET /api/admin/content (all sections)
func (h *AdminSettingsHandler) HandleAllContent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendMethodNotAllowed(w)
		return
	}

	content, err := h.settingsRepo.GetAllContent()
	if err != nil {
		sendInternalError(w, "Failed to fetch content")
		return
	}
	sendSuccess(w, content)
}

// extractSectionFromPath extracts the section name from the URL path
// e.g., /api/admin/content/hero -> hero
func extractSectionFromPath(path string) string {
	// Simple extraction - get the last path segment
	id, err := parseIDFromPath(path)
	if err == nil && id > 0 {
		// This is a numeric ID, not a section name
		return ""
	}

	// Get last segment
	segments := splitPath(path)
	if len(segments) > 0 {
		return segments[len(segments)-1]
	}
	return ""
}

func splitPath(path string) []string {
	var result []string
	current := ""
	for _, c := range path {
		if c == '/' {
			if current != "" {
				result = append(result, current)
				current = ""
			}
		} else {
			current += string(c)
		}
	}
	if current != "" {
		result = append(result, current)
	}
	return result
}
