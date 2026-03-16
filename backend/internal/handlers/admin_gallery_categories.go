package handlers

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"github.com/usmonbek/dentist-backend/internal/models"
	"github.com/usmonbek/dentist-backend/internal/repository"
	"github.com/usmonbek/dentist-backend/internal/services"
	"gorm.io/datatypes"
)

// generateSlug creates a URL-friendly slug from a label
func generateSlug(label string) string {
	// Convert to lowercase
	slug := strings.ToLower(label)

	// Remove special characters (keep only alphanumeric, spaces, hyphens, underscores)
	reg := regexp.MustCompile(`[^a-z0-9\s\-_]+`)
	slug = reg.ReplaceAllString(slug, "")

	// Replace spaces and hyphens with underscores
	slug = strings.ReplaceAll(slug, " ", "_")
	slug = strings.ReplaceAll(slug, "-", "_")

	// Replace multiple underscores with single underscore
	reg = regexp.MustCompile(`_+`)
	slug = reg.ReplaceAllString(slug, "_")

	// Trim underscores from start and end
	slug = strings.Trim(slug, "_")

	return slug
}

// AdminGalleryCategoriesHandler handles admin gallery category operations
type AdminGalleryCategoriesHandler struct {
	repo      *repository.GalleryCategoryRepository
	validator *services.Validator
}

// NewAdminGalleryCategoriesHandler creates a new admin gallery categories handler
func NewAdminGalleryCategoriesHandler(repo *repository.GalleryCategoryRepository, validator *services.Validator) *AdminGalleryCategoriesHandler {
	return &AdminGalleryCategoriesHandler{
		repo:      repo,
		validator: validator,
	}
}

// HandleGalleryCategories handles GET (list) and POST (create) requests
func (h *AdminGalleryCategoriesHandler) HandleGalleryCategories(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.listGalleryCategories(w, r)
	case http.MethodPost:
		h.createGalleryCategory(w, r)
	default:
		sendMethodNotAllowed(w)
	}
}

// HandleGalleryCategory handles GET, PUT, DELETE for specific category
func (h *AdminGalleryCategoriesHandler) HandleGalleryCategory(w http.ResponseWriter, r *http.Request) {
	// Extract ID from path
	idStr := strings.TrimPrefix(r.URL.Path, "/api/admin/gallery-categories/")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		sendBadRequest(w, "Invalid category ID")
		return
	}

	switch r.Method {
	case http.MethodGet:
		h.getGalleryCategory(w, r, uint(id))
	case http.MethodPut:
		h.updateGalleryCategory(w, r, uint(id))
	case http.MethodDelete:
		h.deleteGalleryCategory(w, r, uint(id))
	default:
		sendMethodNotAllowed(w)
	}
}

func (h *AdminGalleryCategoriesHandler) listGalleryCategories(w http.ResponseWriter, r *http.Request) {
	categories, err := h.repo.FindAll()
	if err != nil {
		sendInternalError(w, "Failed to fetch categories")
		return
	}

	sendSuccess(w, categories)
}

func (h *AdminGalleryCategoriesHandler) getGalleryCategory(w http.ResponseWriter, r *http.Request, id uint) {
	category, err := h.repo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Category not found")
		return
	}

	sendSuccess(w, category)
}

func (h *AdminGalleryCategoriesHandler) createGalleryCategory(w http.ResponseWriter, r *http.Request) {
	var req models.GalleryCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendBadRequest(w, "Invalid request body")
		return
	}

	if err := h.validator.Validate(req); err != nil {
		sendBadRequest(w, err.Error())
		return
	}

	// Auto-generate slug from label if not provided
	if req.Slug == "" {
		req.Slug = generateSlug(req.Label)
	}

	// Validate slug format (alphanumeric and underscores only)
	if !regexp.MustCompile(`^[a-z0-9_]+$`).MatchString(req.Slug) {
		sendBadRequest(w, "Slug must contain only lowercase letters, numbers, and underscores")
		return
	}

	// Check if slug already exists
	existing, _ := h.repo.FindBySlug(req.Slug)
	if existing != nil {
		sendBadRequest(w, "Category with this slug already exists")
		return
	}

	// Get next display order if not provided
	if req.DisplayOrder == 0 {
		maxOrder, err := h.repo.GetMaxOrder()
		if err == nil {
			req.DisplayOrder = maxOrder + 1
		}
	}

	category := &models.GalleryCategory{
		Slug:         req.Slug,
		Label:        req.Label,
		Description:  req.Description,
		DisplayOrder: req.DisplayOrder,
		Enabled:      req.Enabled,
		Translations: datatypes.JSONMap(req.Translations),
	}

	if err := h.repo.Create(category); err != nil {
		sendInternalError(w, "Failed to create category")
		return
	}

	sendCreated(w, category)
}

func (h *AdminGalleryCategoriesHandler) updateGalleryCategory(w http.ResponseWriter, r *http.Request, id uint) {
	category, err := h.repo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Category not found")
		return
	}

	var req models.GalleryCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendBadRequest(w, "Invalid request body")
		return
	}

	if err := h.validator.Validate(req); err != nil {
		sendBadRequest(w, err.Error())
		return
	}

	// Auto-generate slug from label if not provided
	if req.Slug == "" {
		req.Slug = generateSlug(req.Label)
	}

	// Validate slug format (alphanumeric and underscores only)
	if !regexp.MustCompile(`^[a-z0-9_]+$`).MatchString(req.Slug) {
		sendBadRequest(w, "Slug must contain only lowercase letters, numbers, and underscores")
		return
	}

	// Check if slug is being changed and if new slug already exists
	if req.Slug != category.Slug {
		existing, _ := h.repo.FindBySlug(req.Slug)
		if existing != nil {
			sendBadRequest(w, "Category with this slug already exists")
			return
		}
	}

	// Update fields
	category.Slug = req.Slug
	category.Label = req.Label
	category.Description = req.Description
	category.DisplayOrder = req.DisplayOrder
	category.Enabled = req.Enabled
	if req.Translations != nil {
		category.Translations = datatypes.JSONMap(req.Translations)
	}

	if err := h.repo.Update(category); err != nil {
		sendInternalError(w, "Failed to update category")
		return
	}

	sendSuccess(w, category)
}

func (h *AdminGalleryCategoriesHandler) deleteGalleryCategory(w http.ResponseWriter, r *http.Request, id uint) {
	// Check if category exists
	_, err := h.repo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Category not found")
		return
	}

	if err := h.repo.Delete(id); err != nil {
		sendInternalError(w, "Failed to delete category")
		return
	}

	sendSuccessMessage(w, "Category deleted successfully")
}
