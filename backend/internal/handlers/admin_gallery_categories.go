package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/usmonbek/dentist-backend/internal/models"
	"github.com/usmonbek/dentist-backend/internal/repository"
	"github.com/usmonbek/dentist-backend/internal/services"
)

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
		RespondError(w, http.StatusMethodNotAllowed, "Method not allowed")
	}
}

// HandleGalleryCategory handles GET, PUT, DELETE for specific category
func (h *AdminGalleryCategoriesHandler) HandleGalleryCategory(w http.ResponseWriter, r *http.Request) {
	// Extract ID from path
	idStr := strings.TrimPrefix(r.URL.Path, "/api/admin/gallery-categories/")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid category ID")
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
		RespondError(w, http.StatusMethodNotAllowed, "Method not allowed")
	}
}

func (h *AdminGalleryCategoriesHandler) listGalleryCategories(w http.ResponseWriter, r *http.Request) {
	categories, err := h.repo.FindAll()
	if err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to fetch categories")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]interface{}{
		"data": categories,
	})
}

func (h *AdminGalleryCategoriesHandler) getGalleryCategory(w http.ResponseWriter, r *http.Request, id uint) {
	category, err := h.repo.FindByID(id)
	if err != nil {
		RespondError(w, http.StatusNotFound, "Category not found")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]interface{}{
		"data": category,
	})
}

func (h *AdminGalleryCategoriesHandler) createGalleryCategory(w http.ResponseWriter, r *http.Request) {
	var req models.GalleryCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.validator.Validate(req); err != nil {
		RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Check if slug already exists
	existing, _ := h.repo.FindBySlug(req.Slug)
	if existing != nil {
		RespondError(w, http.StatusBadRequest, "Category with this slug already exists")
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
	}

	if err := h.repo.Create(category); err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to create category")
		return
	}

	RespondJSON(w, http.StatusCreated, map[string]interface{}{
		"data":    category,
		"message": "Category created successfully",
	})
}

func (h *AdminGalleryCategoriesHandler) updateGalleryCategory(w http.ResponseWriter, r *http.Request, id uint) {
	category, err := h.repo.FindByID(id)
	if err != nil {
		RespondError(w, http.StatusNotFound, "Category not found")
		return
	}

	var req models.GalleryCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.validator.Validate(req); err != nil {
		RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Check if slug is being changed and if new slug already exists
	if req.Slug != category.Slug {
		existing, _ := h.repo.FindBySlug(req.Slug)
		if existing != nil {
			RespondError(w, http.StatusBadRequest, "Category with this slug already exists")
			return
		}
	}

	// Update fields
	category.Slug = req.Slug
	category.Label = req.Label
	category.Description = req.Description
	category.DisplayOrder = req.DisplayOrder
	category.Enabled = req.Enabled

	if err := h.repo.Update(category); err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to update category")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]interface{}{
		"data":    category,
		"message": "Category updated successfully",
	})
}

func (h *AdminGalleryCategoriesHandler) deleteGalleryCategory(w http.ResponseWriter, r *http.Request, id uint) {
	// Check if category exists
	_, err := h.repo.FindByID(id)
	if err != nil {
		RespondError(w, http.StatusNotFound, "Category not found")
		return
	}

	if err := h.repo.Delete(id); err != nil {
		RespondError(w, http.StatusInternalServerError, "Failed to delete category")
		return
	}

	RespondJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Category deleted successfully",
	})
}
