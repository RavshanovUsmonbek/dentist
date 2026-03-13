package handlers

import (
	"net/http"

	"github.com/usmonbek/dentist-backend/internal/models"
	"github.com/usmonbek/dentist-backend/internal/repository"
	"github.com/usmonbek/dentist-backend/internal/services"
)

// AdminGalleryHandler handles admin gallery CRUD endpoints
type AdminGalleryHandler struct {
	galleryRepo *repository.GalleryRepository
	validator   *services.Validator
}

// NewAdminGalleryHandler creates a new AdminGalleryHandler
func NewAdminGalleryHandler(galleryRepo *repository.GalleryRepository, validator *services.Validator) *AdminGalleryHandler {
	return &AdminGalleryHandler{
		galleryRepo: galleryRepo,
		validator:   validator,
	}
}

// HandleGallery handles GET/POST /api/admin/gallery
func (h *AdminGalleryHandler) HandleGallery(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.listGallery(w, r)
	case http.MethodPost:
		h.createGalleryImage(w, r)
	default:
		sendMethodNotAllowed(w)
	}
}

// HandleGalleryImage handles GET/PUT/DELETE /api/admin/gallery/:id
func (h *AdminGalleryHandler) HandleGalleryImage(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromPath(r.URL.Path)
	if err != nil {
		sendBadRequest(w, "Invalid gallery image ID")
		return
	}

	switch r.Method {
	case http.MethodGet:
		h.getGalleryImage(w, r, id)
	case http.MethodPut:
		h.updateGalleryImage(w, r, id)
	case http.MethodDelete:
		h.deleteGalleryImage(w, r, id)
	default:
		sendMethodNotAllowed(w)
	}
}

func (h *AdminGalleryHandler) listGallery(w http.ResponseWriter, r *http.Request) {
	images, err := h.galleryRepo.FindAll()
	if err != nil {
		sendInternalError(w, "Failed to fetch gallery images")
		return
	}
	sendSuccess(w, images)
}

func (h *AdminGalleryHandler) getGalleryImage(w http.ResponseWriter, r *http.Request, id uint) {
	image, err := h.galleryRepo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Gallery image not found")
		return
	}
	sendSuccess(w, image)
}

func (h *AdminGalleryHandler) createGalleryImage(w http.ResponseWriter, r *http.Request) {
	var req models.GalleryImageRequest
	if err := decodeJSON(r, &req); err != nil {
		sendBadRequest(w, "Invalid request body")
		return
	}

	if err := h.validator.Validate(&req); err != nil {
		sendBadRequest(w, err.Error())
		return
	}

	// Get max order and add 1
	maxOrder, _ := h.galleryRepo.GetMaxOrder()

	active := true
	if req.Active != nil {
		active = *req.Active
	}

	image := &models.GalleryImage{
		Filename:     req.Filename,
		AltText:      req.AltText,
		DisplayOrder: maxOrder + 1,
		Active:       active,
	}

	if err := h.galleryRepo.Create(image); err != nil {
		sendInternalError(w, "Failed to create gallery image")
		return
	}

	sendCreated(w, image)
}

func (h *AdminGalleryHandler) updateGalleryImage(w http.ResponseWriter, r *http.Request, id uint) {
	image, err := h.galleryRepo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Gallery image not found")
		return
	}

	var req models.GalleryImageRequest
	if err := decodeJSON(r, &req); err != nil {
		sendBadRequest(w, "Invalid request body")
		return
	}

	if err := h.validator.Validate(&req); err != nil {
		sendBadRequest(w, err.Error())
		return
	}

	image.Filename = req.Filename
	image.AltText = req.AltText
	if req.DisplayOrder > 0 {
		image.DisplayOrder = req.DisplayOrder
	}
	if req.Active != nil {
		image.Active = *req.Active
	}

	if err := h.galleryRepo.Update(image); err != nil {
		sendInternalError(w, "Failed to update gallery image")
		return
	}

	sendSuccess(w, image)
}

func (h *AdminGalleryHandler) deleteGalleryImage(w http.ResponseWriter, r *http.Request, id uint) {
	_, err := h.galleryRepo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Gallery image not found")
		return
	}

	if err := h.galleryRepo.Delete(id); err != nil {
		sendInternalError(w, "Failed to delete gallery image")
		return
	}

	sendSuccessMessage(w, "Gallery image deleted successfully")
}
