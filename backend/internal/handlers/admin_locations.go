package handlers

import (
	"net/http"

	"github.com/usmonbek/dentist-backend/internal/models"
	"github.com/usmonbek/dentist-backend/internal/repository"
	"github.com/usmonbek/dentist-backend/internal/services"
	"gorm.io/datatypes"
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

	location := &models.Location{
		Name:          req.Name,
		Address:       req.Address,
		BusinessHours: req.BusinessHours,
		Latitude:      req.Latitude,
		Longitude:     req.Longitude,
		DisplayOrder:  maxOrder + 1,
		Active:        active,
		Translations:  datatypes.JSONMap(req.Translations),
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

	location.Name = req.Name
	location.Address = req.Address
	location.BusinessHours = req.BusinessHours
	location.Latitude = req.Latitude
	location.Longitude = req.Longitude

	if req.DisplayOrder > 0 {
		location.DisplayOrder = req.DisplayOrder
	}
	if req.Active != nil {
		location.Active = *req.Active
	}
	if req.Translations != nil {
		location.Translations = datatypes.JSONMap(req.Translations)
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
