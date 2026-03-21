package handlers

import (
	"net/http"
	"strings"
	"unicode"

	"github.com/usmonbek/dentist-backend/internal/models"
	"github.com/usmonbek/dentist-backend/internal/repository"
	"github.com/usmonbek/dentist-backend/internal/services"
)

// PublicHandler handles public API endpoints (no auth required)
type PublicHandler struct {
	serviceRepo         *repository.ServiceRepository
	testimonialRepo     *repository.TestimonialRepository
	galleryRepo         *repository.GalleryRepository
	galleryCategoryRepo *repository.GalleryCategoryRepository
	locationRepo        *repository.LocationRepository
	settingsRepo        *repository.SettingsRepository
	validator           *services.Validator
}

// NewPublicHandler creates a new PublicHandler
func NewPublicHandler(
	serviceRepo *repository.ServiceRepository,
	testimonialRepo *repository.TestimonialRepository,
	galleryRepo *repository.GalleryRepository,
	galleryCategoryRepo *repository.GalleryCategoryRepository,
	locationRepo *repository.LocationRepository,
	settingsRepo *repository.SettingsRepository,
	validator *services.Validator,
) *PublicHandler {
	return &PublicHandler{
		serviceRepo:         serviceRepo,
		testimonialRepo:     testimonialRepo,
		galleryRepo:         galleryRepo,
		galleryCategoryRepo: galleryCategoryRepo,
		locationRepo:        locationRepo,
		settingsRepo:        settingsRepo,
		validator:           validator,
	}
}

// HandleServices handles GET /api/services (public)
func (h *PublicHandler) HandleServices(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendMethodNotAllowed(w)
		return
	}

	lang := r.URL.Query().Get("lang")
	if lang == "" {
		lang = "uz" // Default to Uzbek
	}

	services, err := h.serviceRepo.FindActive()
	if err != nil {
		sendInternalError(w, "Failed to fetch services")
		return
	}

	// Translate services to requested language
	translated := repository.ExtractServicesTranslation(services, lang)
	sendSuccess(w, translated)
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
// Supports optional ?category=X and ?lang=X query parameters
func (h *PublicHandler) HandleGallery(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendMethodNotAllowed(w)
		return
	}

	// Check for query parameters
	category := r.URL.Query().Get("category")
	lang := r.URL.Query().Get("lang")
	if lang == "" {
		lang = "uz" // Default to Uzbek
	}

	var images []models.GalleryImage
	var err error

	if category != "" {
		// Filter by category if specified
		images, err = h.galleryRepo.FindActiveByCategory(category)
	} else {
		// Return all active images if no category specified
		images, err = h.galleryRepo.FindActive()
	}

	if err != nil {
		sendInternalError(w, "Failed to fetch gallery images")
		return
	}

	// Translate gallery images to requested language
	translated := repository.ExtractGalleryImagesTranslation(images, lang)
	sendSuccess(w, translated)
}

// HandleSettings handles GET /api/settings (public)
// Supports optional ?lang=X query parameter
func (h *PublicHandler) HandleSettings(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendMethodNotAllowed(w)
		return
	}

	lang := r.URL.Query().Get("lang")
	if lang == "" {
		lang = "uz" // Default to Uzbek
	}

	settings, err := h.settingsRepo.GetSettingsMapByLang(lang)
	if err != nil {
		sendInternalError(w, "Failed to fetch settings")
		return
	}
	sendSuccess(w, settings)
}

// HandleContent handles GET /api/content/:section (public)
// Supports optional ?lang=X query parameter
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

	lang := r.URL.Query().Get("lang")
	if lang == "" {
		lang = "uz" // Default to Uzbek
	}

	content, err := h.settingsRepo.GetContentMapByLang(section, lang)
	if err != nil {
		sendInternalError(w, "Failed to fetch content")
		return
	}
	sendSuccess(w, content)
}

// HandleLocations handles GET /api/locations (public)
// Supports optional ?lang=X query parameter
func (h *PublicHandler) HandleLocations(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendMethodNotAllowed(w)
		return
	}

	lang := r.URL.Query().Get("lang")
	if lang == "" {
		lang = "uz" // Default to Uzbek
	}

	locations, err := h.locationRepo.FindActive()
	if err != nil {
		sendInternalError(w, "Failed to fetch locations")
		return
	}

	// Translate locations to requested language
	translated := repository.ExtractLocationsTranslation(locations, lang)
	sendSuccess(w, translated)
}

// HandleTestimonialSubmit handles POST /api/testimonials (public submission)
func (h *PublicHandler) HandleTestimonialSubmit(w http.ResponseWriter, r *http.Request) {
	var req models.PublicTestimonialRequest
	if err := decodeJSON(r, &req); err != nil {
		sendBadRequest(w, "Invalid request body")
		return
	}

	if err := h.validator.Validate(&req); err != nil {
		sendBadRequest(w, err.Error())
		return
	}

	// Auto-generate initials from name (first letter of each word, max 2)
	initials := generateInitials(req.Name)

	testimonial := &models.Testimonial{
		Name:     req.Name,
		Initials: initials,
		Rating:   req.Rating,
		Text:     req.Text,
		Active:   false,
		Status:   "pending",
	}

	if err := h.testimonialRepo.CreateSubmission(testimonial); err != nil {
		sendInternalError(w, "Failed to submit testimonial")
		return
	}

	sendSuccessMessage(w, "Thank you! Your review has been submitted and is pending approval.")
}

// generateInitials creates 1-2 letter initials from a full name
func generateInitials(name string) string {
	words := strings.Fields(name)
	var initials strings.Builder
	for _, word := range words {
		runes := []rune(word)
		if len(runes) > 0 && unicode.IsLetter(runes[0]) {
			initials.WriteRune(unicode.ToUpper(runes[0]))
		}
		if initials.Len() >= 2 {
			break
		}
	}
	if initials.Len() == 0 {
		return "?"
	}
	return initials.String()
}

// HandleGalleryCategories handles GET /api/gallery-categories (public)
// Only returns enabled categories that have at least one active image
// Supports optional ?lang=X query parameter
func (h *PublicHandler) HandleGalleryCategories(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendMethodNotAllowed(w)
		return
	}

	lang := r.URL.Query().Get("lang")
	if lang == "" {
		lang = "uz" // Default to Uzbek
	}

	categories, err := h.galleryCategoryRepo.FindEnabledWithImages()
	if err != nil {
		sendInternalError(w, "Failed to fetch gallery categories")
		return
	}

	// Translate gallery categories to requested language
	translated := repository.ExtractGalleryCategoriesTranslation(categories, lang)
	sendSuccess(w, translated)
}
