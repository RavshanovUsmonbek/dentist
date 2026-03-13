package handlers

import (
	"net/http"

	"github.com/usmonbek/dentist-backend/internal/models"
	"github.com/usmonbek/dentist-backend/internal/repository"
	"github.com/usmonbek/dentist-backend/internal/services"
)

// AdminServicesHandler handles admin services CRUD endpoints
type AdminServicesHandler struct {
	serviceRepo *repository.ServiceRepository
	validator   *services.Validator
}

// NewAdminServicesHandler creates a new AdminServicesHandler
func NewAdminServicesHandler(serviceRepo *repository.ServiceRepository, validator *services.Validator) *AdminServicesHandler {
	return &AdminServicesHandler{
		serviceRepo: serviceRepo,
		validator:   validator,
	}
}

// HandleServices handles GET/POST /api/admin/services
func (h *AdminServicesHandler) HandleServices(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.listServices(w, r)
	case http.MethodPost:
		h.createService(w, r)
	default:
		sendMethodNotAllowed(w)
	}
}

// HandleService handles GET/PUT/DELETE /api/admin/services/:id
func (h *AdminServicesHandler) HandleService(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromPath(r.URL.Path)
	if err != nil {
		sendBadRequest(w, "Invalid service ID")
		return
	}

	switch r.Method {
	case http.MethodGet:
		h.getService(w, r, id)
	case http.MethodPut:
		h.updateService(w, r, id)
	case http.MethodDelete:
		h.deleteService(w, r, id)
	default:
		sendMethodNotAllowed(w)
	}
}

func (h *AdminServicesHandler) listServices(w http.ResponseWriter, r *http.Request) {
	services, err := h.serviceRepo.FindAll()
	if err != nil {
		sendInternalError(w, "Failed to fetch services")
		return
	}
	sendSuccess(w, services)
}

func (h *AdminServicesHandler) getService(w http.ResponseWriter, r *http.Request, id uint) {
	service, err := h.serviceRepo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Service not found")
		return
	}
	sendSuccess(w, service)
}

func (h *AdminServicesHandler) createService(w http.ResponseWriter, r *http.Request) {
	var req models.ServiceRequest
	if err := decodeJSON(r, &req); err != nil {
		sendBadRequest(w, "Invalid request body")
		return
	}

	if err := h.validator.Validate(&req); err != nil {
		sendBadRequest(w, err.Error())
		return
	}

	// Get max order and add 1
	maxOrder, _ := h.serviceRepo.GetMaxOrder()

	active := true
	if req.Active != nil {
		active = *req.Active
	}

	service := &models.Service{
		Title:        req.Title,
		Description:  req.Description,
		Icon:         req.Icon,
		DisplayOrder: maxOrder + 1,
		Active:       active,
	}

	if err := h.serviceRepo.Create(service); err != nil {
		sendInternalError(w, "Failed to create service")
		return
	}

	sendCreated(w, service)
}

func (h *AdminServicesHandler) updateService(w http.ResponseWriter, r *http.Request, id uint) {
	service, err := h.serviceRepo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Service not found")
		return
	}

	var req models.ServiceRequest
	if err := decodeJSON(r, &req); err != nil {
		sendBadRequest(w, "Invalid request body")
		return
	}

	if err := h.validator.Validate(&req); err != nil {
		sendBadRequest(w, err.Error())
		return
	}

	service.Title = req.Title
	service.Description = req.Description
	service.Icon = req.Icon
	if req.DisplayOrder > 0 {
		service.DisplayOrder = req.DisplayOrder
	}
	if req.Active != nil {
		service.Active = *req.Active
	}

	if err := h.serviceRepo.Update(service); err != nil {
		sendInternalError(w, "Failed to update service")
		return
	}

	sendSuccess(w, service)
}

func (h *AdminServicesHandler) deleteService(w http.ResponseWriter, r *http.Request, id uint) {
	_, err := h.serviceRepo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Service not found")
		return
	}

	if err := h.serviceRepo.Delete(id); err != nil {
		sendInternalError(w, "Failed to delete service")
		return
	}

	sendSuccessMessage(w, "Service deleted successfully")
}
