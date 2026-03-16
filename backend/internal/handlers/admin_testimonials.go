package handlers

import (
	"net/http"

	"github.com/usmonbek/dentist-backend/internal/models"
	"github.com/usmonbek/dentist-backend/internal/repository"
	"github.com/usmonbek/dentist-backend/internal/services"
	"gorm.io/datatypes"
)

// AdminTestimonialsHandler handles admin testimonials CRUD endpoints
type AdminTestimonialsHandler struct {
	testimonialRepo *repository.TestimonialRepository
	validator       *services.Validator
}

// NewAdminTestimonialsHandler creates a new AdminTestimonialsHandler
func NewAdminTestimonialsHandler(testimonialRepo *repository.TestimonialRepository, validator *services.Validator) *AdminTestimonialsHandler {
	return &AdminTestimonialsHandler{
		testimonialRepo: testimonialRepo,
		validator:       validator,
	}
}

// HandleTestimonials handles GET/POST /api/admin/testimonials
func (h *AdminTestimonialsHandler) HandleTestimonials(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.listTestimonials(w, r)
	case http.MethodPost:
		h.createTestimonial(w, r)
	default:
		sendMethodNotAllowed(w)
	}
}

// HandleTestimonial handles GET/PUT/DELETE /api/admin/testimonials/:id
func (h *AdminTestimonialsHandler) HandleTestimonial(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromPath(r.URL.Path)
	if err != nil {
		sendBadRequest(w, "Invalid testimonial ID")
		return
	}

	switch r.Method {
	case http.MethodGet:
		h.getTestimonial(w, r, id)
	case http.MethodPut:
		h.updateTestimonial(w, r, id)
	case http.MethodDelete:
		h.deleteTestimonial(w, r, id)
	default:
		sendMethodNotAllowed(w)
	}
}

func (h *AdminTestimonialsHandler) listTestimonials(w http.ResponseWriter, r *http.Request) {
	testimonials, err := h.testimonialRepo.FindAll()
	if err != nil {
		sendInternalError(w, "Failed to fetch testimonials")
		return
	}
	sendSuccess(w, testimonials)
}

func (h *AdminTestimonialsHandler) getTestimonial(w http.ResponseWriter, r *http.Request, id uint) {
	testimonial, err := h.testimonialRepo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Testimonial not found")
		return
	}
	sendSuccess(w, testimonial)
}

func (h *AdminTestimonialsHandler) createTestimonial(w http.ResponseWriter, r *http.Request) {
	var req models.TestimonialRequest
	if err := decodeJSON(r, &req); err != nil {
		sendBadRequest(w, "Invalid request body")
		return
	}

	if err := h.validator.Validate(&req); err != nil {
		sendBadRequest(w, err.Error())
		return
	}

	// Get max order and add 1
	maxOrder, _ := h.testimonialRepo.GetMaxOrder()

	active := true
	if req.Active != nil {
		active = *req.Active
	}

	testimonial := &models.Testimonial{
		Name:         req.Name,
		Initials:     req.Initials,
		Rating:       req.Rating,
		Text:         req.Text,
		DisplayOrder: maxOrder + 1,
		Active:       active,
		Translations: datatypes.JSONMap(req.Translations),
	}

	if err := h.testimonialRepo.Create(testimonial); err != nil {
		sendInternalError(w, "Failed to create testimonial")
		return
	}

	sendCreated(w, testimonial)
}

func (h *AdminTestimonialsHandler) updateTestimonial(w http.ResponseWriter, r *http.Request, id uint) {
	testimonial, err := h.testimonialRepo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Testimonial not found")
		return
	}

	var req models.TestimonialRequest
	if err := decodeJSON(r, &req); err != nil {
		sendBadRequest(w, "Invalid request body")
		return
	}

	if err := h.validator.Validate(&req); err != nil {
		sendBadRequest(w, err.Error())
		return
	}

	testimonial.Name = req.Name
	testimonial.Initials = req.Initials
	testimonial.Rating = req.Rating
	testimonial.Text = req.Text
	if req.DisplayOrder > 0 {
		testimonial.DisplayOrder = req.DisplayOrder
	}
	if req.Active != nil {
		testimonial.Active = *req.Active
	}
	if req.Translations != nil {
		testimonial.Translations = datatypes.JSONMap(req.Translations)
	}

	if err := h.testimonialRepo.Update(testimonial); err != nil {
		sendInternalError(w, "Failed to update testimonial")
		return
	}

	sendSuccess(w, testimonial)
}

func (h *AdminTestimonialsHandler) deleteTestimonial(w http.ResponseWriter, r *http.Request, id uint) {
	_, err := h.testimonialRepo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Testimonial not found")
		return
	}

	if err := h.testimonialRepo.Delete(id); err != nil {
		sendInternalError(w, "Failed to delete testimonial")
		return
	}

	sendSuccessMessage(w, "Testimonial deleted successfully")
}
