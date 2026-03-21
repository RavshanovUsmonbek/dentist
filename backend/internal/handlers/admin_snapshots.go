package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/usmonbek/dentist-backend/internal/models"
	"github.com/usmonbek/dentist-backend/internal/repository"
	"github.com/usmonbek/dentist-backend/internal/services"
	"gorm.io/datatypes"
)

// AdminSnapshotsHandler handles snapshot CRUD, restore, export, and import
type AdminSnapshotsHandler struct {
	snapshotRepo    *repository.SnapshotRepository
	serviceRepo     *repository.ServiceRepository
	testimonialRepo *repository.TestimonialRepository
	galleryRepo     *repository.GalleryRepository
	galleryCatRepo  *repository.GalleryCategoryRepository
	locationRepo    *repository.LocationRepository
	settingsRepo    *repository.SettingsRepository
	validator       *services.Validator
}

// NewAdminSnapshotsHandler creates a new AdminSnapshotsHandler
func NewAdminSnapshotsHandler(
	snapshotRepo    *repository.SnapshotRepository,
	serviceRepo     *repository.ServiceRepository,
	testimonialRepo *repository.TestimonialRepository,
	galleryRepo     *repository.GalleryRepository,
	galleryCatRepo  *repository.GalleryCategoryRepository,
	locationRepo    *repository.LocationRepository,
	settingsRepo    *repository.SettingsRepository,
	validator       *services.Validator,
) *AdminSnapshotsHandler {
	return &AdminSnapshotsHandler{
		snapshotRepo:    snapshotRepo,
		serviceRepo:     serviceRepo,
		testimonialRepo: testimonialRepo,
		galleryRepo:     galleryRepo,
		galleryCatRepo:  galleryCatRepo,
		locationRepo:    locationRepo,
		settingsRepo:    settingsRepo,
		validator:       validator,
	}
}

// HandleSnapshots handles GET/POST /api/admin/snapshots
func (h *AdminSnapshotsHandler) HandleSnapshots(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.listSnapshots(w, r)
	case http.MethodPost:
		h.createSnapshot(w, r)
	default:
		sendMethodNotAllowed(w)
	}
}

// HandleSnapshotImport handles POST /api/admin/snapshots/import
func (h *AdminSnapshotsHandler) HandleSnapshotImport(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendMethodNotAllowed(w)
		return
	}
	h.importSnapshot(w, r)
}

// HandleSnapshotByID handles /api/admin/snapshots/:id, /api/admin/snapshots/:id/restore, /api/admin/snapshots/:id/export
func (h *AdminSnapshotsHandler) HandleSnapshotByID(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	if strings.HasSuffix(path, "/restore") {
		if r.Method != http.MethodPost {
			sendMethodNotAllowed(w)
			return
		}
		h.restoreSnapshot(w, r)
	} else if strings.HasSuffix(path, "/export") {
		if r.Method != http.MethodGet {
			sendMethodNotAllowed(w)
			return
		}
		h.exportSnapshot(w, r)
	} else {
		switch r.Method {
		case http.MethodGet:
			h.getSnapshot(w, r)
		case http.MethodDelete:
			h.deleteSnapshot(w, r)
		default:
			sendMethodNotAllowed(w)
		}
	}
}

func (h *AdminSnapshotsHandler) listSnapshots(w http.ResponseWriter, r *http.Request) {
	snapshots, err := h.snapshotRepo.FindAll()
	if err != nil {
		sendInternalError(w, "Failed to fetch snapshots")
		return
	}
	sendSuccess(w, snapshots)
}

func (h *AdminSnapshotsHandler) createSnapshot(w http.ResponseWriter, r *http.Request) {
	var req models.SnapshotRequest
	if err := decodeJSON(r, &req); err != nil {
		sendBadRequest(w, "Invalid request body")
		return
	}

	if err := h.validator.Validate(&req); err != nil {
		sendBadRequest(w, err.Error())
		return
	}

	data, err := h.snapshotRepo.CaptureData(
		h.serviceRepo,
		h.testimonialRepo,
		h.galleryRepo,
		h.galleryCatRepo,
		h.locationRepo,
		h.settingsRepo,
	)
	if err != nil {
		sendInternalError(w, fmt.Sprintf("Failed to capture data: %v", err))
		return
	}

	snapshot := &models.Snapshot{
		Name:        req.Name,
		Description: req.Description,
		Data:        data,
	}

	if err := h.snapshotRepo.Create(snapshot); err != nil {
		sendInternalError(w, "Failed to save snapshot")
		return
	}

	sendCreated(w, snapshot)
}

func (h *AdminSnapshotsHandler) getSnapshot(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromPath(r.URL.Path)
	if err != nil {
		sendBadRequest(w, "Invalid snapshot ID")
		return
	}

	snapshot, err := h.snapshotRepo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Snapshot not found")
		return
	}

	sendSuccess(w, snapshot)
}

func (h *AdminSnapshotsHandler) deleteSnapshot(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromPath(r.URL.Path)
	if err != nil {
		sendBadRequest(w, "Invalid snapshot ID")
		return
	}

	if _, err := h.snapshotRepo.FindByID(id); err != nil {
		sendNotFound(w, "Snapshot not found")
		return
	}

	if err := h.snapshotRepo.Delete(id); err != nil {
		sendInternalError(w, "Failed to delete snapshot")
		return
	}

	sendSuccessMessage(w, "Snapshot deleted successfully")
}

func (h *AdminSnapshotsHandler) restoreSnapshot(w http.ResponseWriter, r *http.Request) {
	// Path is /api/admin/snapshots/:id/restore — strip /restore suffix before parsing ID
	path := strings.TrimSuffix(r.URL.Path, "/restore")
	id, err := parseIDFromPath(path)
	if err != nil {
		sendBadRequest(w, "Invalid snapshot ID")
		return
	}

	snapshot, err := h.snapshotRepo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Snapshot not found")
		return
	}

	if err := repository.ValidateSnapshotData(snapshot.Data); err != nil {
		sendBadRequest(w, fmt.Sprintf("Invalid snapshot data: %v", err))
		return
	}

	if err := h.snapshotRepo.RestoreData(snapshot.Data); err != nil {
		sendInternalError(w, fmt.Sprintf("Failed to restore snapshot: %v", err))
		return
	}

	sendSuccessMessage(w, "Snapshot restored successfully")
}

func (h *AdminSnapshotsHandler) exportSnapshot(w http.ResponseWriter, r *http.Request) {
	// Path is /api/admin/snapshots/:id/export — strip /export suffix before parsing ID
	path := strings.TrimSuffix(r.URL.Path, "/export")
	id, err := parseIDFromPath(path)
	if err != nil {
		sendBadRequest(w, "Invalid snapshot ID")
		return
	}

	snapshot, err := h.snapshotRepo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Snapshot not found")
		return
	}

	b, err := json.MarshalIndent(snapshot.Data, "", "  ")
	if err != nil {
		sendInternalError(w, "Failed to export snapshot")
		return
	}

	filename := fmt.Sprintf("snapshot-%d.json", snapshot.ID)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename))
	w.WriteHeader(http.StatusOK)
	w.Write(b)
}

func (h *AdminSnapshotsHandler) importSnapshot(w http.ResponseWriter, r *http.Request) {
	var req models.ImportSnapshotRequest
	if err := decodeJSON(r, &req); err != nil {
		sendBadRequest(w, "Invalid request body")
		return
	}

	if err := h.validator.Validate(&req); err != nil {
		sendBadRequest(w, err.Error())
		return
	}

	if err := repository.ValidateSnapshotData(req.Data); err != nil {
		sendBadRequest(w, fmt.Sprintf("Invalid snapshot data: %v", err))
		return
	}

	// Convert to JSONMap via JSON round-trip
	b, err := json.Marshal(req.Data)
	if err != nil {
		sendInternalError(w, "Failed to process snapshot data")
		return
	}
	var jsonData datatypes.JSONMap
	if err := json.Unmarshal(b, &jsonData); err != nil {
		sendInternalError(w, "Failed to process snapshot data")
		return
	}

	// If ?restore=true, restore immediately
	if r.URL.Query().Get("restore") == "true" {
		if err := h.snapshotRepo.RestoreData(jsonData); err != nil {
			sendInternalError(w, fmt.Sprintf("Failed to restore: %v", err))
			return
		}
	}

	// Save as a new snapshot record
	snapshot := &models.Snapshot{
		Name:        req.Name,
		Description: req.Description,
		Data:        jsonData,
	}

	if err := h.snapshotRepo.Create(snapshot); err != nil {
		sendInternalError(w, "Failed to save imported snapshot")
		return
	}

	sendCreated(w, snapshot)
}
