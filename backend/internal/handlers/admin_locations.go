package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/usmonbek/dentist-backend/internal/models"
	"github.com/usmonbek/dentist-backend/internal/repository"
	"github.com/usmonbek/dentist-backend/internal/services"
)

// AdminLocationsHandler handles admin location CRUD endpoints
type AdminLocationsHandler struct {
	locationRepo *repository.LocationRepository
	validator    *services.Validator
}

// NewAdminLocationsHandler creates a new AdminLocationsHandler
func NewAdminLocationsHandler(locationRepo *repository.LocationRepository, validator *services.Validator) *AdminLocationsHandler {
	return &AdminLocationsHandler{
		locationRepo: locationRepo,
		validator:    validator,
	}
}

// HandleLocations handles GET/POST /api/admin/locations
func (h *AdminLocationsHandler) HandleLocations(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.listLocations(w, r)
	case http.MethodPost:
		h.createLocation(w, r)
	default:
		sendMethodNotAllowed(w)
	}
}

// HandleLocation handles GET/PUT/DELETE /api/admin/locations/:id
func (h *AdminLocationsHandler) HandleLocation(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromPath(r.URL.Path)
	if err != nil {
		sendBadRequest(w, "Invalid location ID")
		return
	}

	switch r.Method {
	case http.MethodGet:
		h.getLocation(w, r, id)
	case http.MethodPut:
		h.updateLocation(w, r, id)
	case http.MethodDelete:
		h.deleteLocation(w, r, id)
	default:
		sendMethodNotAllowed(w)
	}
}

func (h *AdminLocationsHandler) listLocations(w http.ResponseWriter, r *http.Request) {
	locations, err := h.locationRepo.FindAll()
	if err != nil {
		sendInternalError(w, "Failed to fetch locations")
		return
	}
	sendSuccess(w, locations)
}

func (h *AdminLocationsHandler) getLocation(w http.ResponseWriter, r *http.Request, id uint) {
	location, err := h.locationRepo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Location not found")
		return
	}
	sendSuccess(w, location)
}

func (h *AdminLocationsHandler) createLocation(w http.ResponseWriter, r *http.Request) {
	var req models.LocationRequest
	if err := decodeJSON(r, &req); err != nil {
		sendBadRequest(w, "Invalid request body")
		return
	}

	if err := h.validator.Validate(&req); err != nil {
		sendBadRequest(w, err.Error())
		return
	}

	// Get max order and add 1
	maxOrder, _ := h.locationRepo.GetMaxOrder()

	active := true
	if req.Active != nil {
		active = *req.Active
	}

	// Convert DaysOfWeek array to JSON string
	daysJSON, err := json.Marshal(req.DaysOfWeek)
	if err != nil {
		sendBadRequest(w, "Invalid days_of_week format")
		return
	}

	location := &models.Location{
		Name:          req.Name,
		AddressLine1:  req.AddressLine1,
		AddressLine2:  req.AddressLine2,
		City:          req.City,
		State:         req.State,
		PostalCode:    req.PostalCode,
		Phone:         req.Phone,
		Email:         req.Email,
		DaysOfWeek:    string(daysJSON),
		HoursWeekday:  req.HoursWeekday,
		HoursSaturday: req.HoursSaturday,
		HoursSunday:   req.HoursSunday,
		DisplayOrder:  maxOrder + 1,
		Active:        active,
	}

	if err := h.locationRepo.Create(location); err != nil {
		sendInternalError(w, "Failed to create location")
		return
	}

	sendCreated(w, location)
}

func (h *AdminLocationsHandler) updateLocation(w http.ResponseWriter, r *http.Request, id uint) {
	location, err := h.locationRepo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Location not found")
		return
	}

	var req models.LocationRequest
	if err := decodeJSON(r, &req); err != nil {
		sendBadRequest(w, "Invalid request body")
		return
	}

	if err := h.validator.Validate(&req); err != nil {
		sendBadRequest(w, err.Error())
		return
	}

	// Convert DaysOfWeek array to JSON string
	daysJSON, err := json.Marshal(req.DaysOfWeek)
	if err != nil {
		sendBadRequest(w, "Invalid days_of_week format")
		return
	}

	location.Name = req.Name
	location.AddressLine1 = req.AddressLine1
	location.AddressLine2 = req.AddressLine2
	location.City = req.City
	location.State = req.State
	location.PostalCode = req.PostalCode
	location.Phone = req.Phone
	location.Email = req.Email
	location.DaysOfWeek = string(daysJSON)
	location.HoursWeekday = req.HoursWeekday
	location.HoursSaturday = req.HoursSaturday
	location.HoursSunday = req.HoursSunday

	if req.DisplayOrder > 0 {
		location.DisplayOrder = req.DisplayOrder
	}
	if req.Active != nil {
		location.Active = *req.Active
	}

	if err := h.locationRepo.Update(location); err != nil {
		sendInternalError(w, "Failed to update location")
		return
	}

	sendSuccess(w, location)
}

func (h *AdminLocationsHandler) deleteLocation(w http.ResponseWriter, r *http.Request, id uint) {
	_, err := h.locationRepo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Location not found")
		return
	}

	if err := h.locationRepo.Delete(id); err != nil {
		sendInternalError(w, "Failed to delete location")
		return
	}

	sendSuccessMessage(w, "Location deleted successfully")
}
