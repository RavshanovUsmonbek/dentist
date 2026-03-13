package handlers

import (
	"net/http"

	"github.com/usmonbek/dentist-backend/internal/repository"
)

// PublicHandler handles public API endpoints (no auth required)
type PublicHandler struct {
	serviceRepo     *repository.ServiceRepository
	testimonialRepo *repository.TestimonialRepository
	galleryRepo     *repository.GalleryRepository
	settingsRepo    *repository.SettingsRepository
}

// NewPublicHandler creates a new PublicHandler
func NewPublicHandler(
	serviceRepo *repository.ServiceRepository,
	testimonialRepo *repository.TestimonialRepository,
	galleryRepo *repository.GalleryRepository,
	settingsRepo *repository.SettingsRepository,
) *PublicHandler {
	return &PublicHandler{
		serviceRepo:     serviceRepo,
		testimonialRepo: testimonialRepo,
		galleryRepo:     galleryRepo,
		settingsRepo:    settingsRepo,
	}
}

// HandleServices handles GET /api/services (public)
func (h *PublicHandler) HandleServices(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendMethodNotAllowed(w)
		return
	}

	services, err := h.serviceRepo.FindActive()
	if err != nil {
		sendInternalError(w, "Failed to fetch services")
		return
	}
	sendSuccess(w, services)
}

// HandleTestimonials handles GET /api/testimonials (public)
func (h *PublicHandler) HandleTestimonials(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendMethodNotAllowed(w)
		return
	}

	testimonials, err := h.testimonialRepo.FindActive()
	if err != nil {
		sendInternalError(w, "Failed to fetch testimonials")
		return
	}
	sendSuccess(w, testimonials)
}

// HandleGallery handles GET /api/gallery (public)
func (h *PublicHandler) HandleGallery(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendMethodNotAllowed(w)
		return
	}

	images, err := h.galleryRepo.FindActive()
	if err != nil {
		sendInternalError(w, "Failed to fetch gallery images")
		return
	}
	sendSuccess(w, images)
}

// HandleSettings handles GET /api/settings (public)
func (h *PublicHandler) HandleSettings(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendMethodNotAllowed(w)
		return
	}

	settings, err := h.settingsRepo.GetSettingsMap()
	if err != nil {
		sendInternalError(w, "Failed to fetch settings")
		return
	}
	sendSuccess(w, settings)
}

// HandleContent handles GET /api/content/:section (public)
func (h *PublicHandler) HandleContent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendMethodNotAllowed(w)
		return
	}

	section := extractSectionFromPath(r.URL.Path)
	if section == "" {
		sendBadRequest(w, "Section is required")
		return
	}

	content, err := h.settingsRepo.GetContentMap(section)
	if err != nil {
		sendInternalError(w, "Failed to fetch content")
		return
	}
	sendSuccess(w, content)
}
