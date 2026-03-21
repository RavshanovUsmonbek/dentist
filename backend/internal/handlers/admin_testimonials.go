package handlers

import (
	"net/http"
	"strconv"

	"github.com/usmonbek/dentist-backend/internal/models"
	"github.com/usmonbek/dentist-backend/internal/repository"
	"github.com/usmonbek/dentist-backend/internal/services"
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

	if err := h.testimonialRepo.Update(testimonial); err != nil {
		sendInternalError(w, "Failed to update testimonial")
		return
	}

	sendSuccess(w, testimonial)
}

// HandlePending handles GET /api/admin/testimonials/pending
func (h *AdminTestimonialsHandler) HandlePending(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendMethodNotAllowed(w)
		return
	}
	testimonials, err := h.testimonialRepo.FindPending()
	if err != nil {
		sendInternalError(w, "Failed to fetch pending testimonials")
		return
	}
	sendSuccess(w, testimonials)
}

// parseIDBeforeAction extracts ID from paths like /api/admin/testimonials/9/approve
func parseIDBeforeAction(path string) (uint, error) {
	parts := splitPath(path)
	// path: [..., "testimonials", "9", "approve"] — ID is second-to-last
	if len(parts) < 2 {
		return 0, strconv.ErrSyntax
	}
	idStr := parts[len(parts)-2]
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return 0, err
	}
	return uint(id), nil
}

// HandleApprove handles PATCH /api/admin/testimonials/:id/approve
func (h *AdminTestimonialsHandler) HandleApprove(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		sendMethodNotAllowed(w)
		return
	}
	id, err := parseIDBeforeAction(r.URL.Path)
	if err != nil {
		sendBadRequest(w, "Invalid testimonial ID")
		return
	}
	if _, err := h.testimonialRepo.FindByID(id); err != nil {
		sendNotFound(w, "Testimonial not found")
		return
	}
	if err := h.testimonialRepo.UpdateStatus(id, "approved", true); err != nil {
		sendInternalError(w, "Failed to approve testimonial")
		return
	}
	sendSuccessMessage(w, "Testimonial approved")
}

// HandleReject handles PATCH /api/admin/testimonials/:id/reject
func (h *AdminTestimonialsHandler) HandleReject(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		sendMethodNotAllowed(w)
		return
	}
	id, err := parseIDBeforeAction(r.URL.Path)
	if err != nil {
		sendBadRequest(w, "Invalid testimonial ID")
		return
	}
	if _, err := h.testimonialRepo.FindByID(id); err != nil {
		sendNotFound(w, "Testimonial not found")
		return
	}
	if err := h.testimonialRepo.UpdateStatus(id, "rejected", false); err != nil {
		sendInternalError(w, "Failed to reject testimonial")
		return
	}
	sendSuccessMessage(w, "Testimonial rejected")
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
