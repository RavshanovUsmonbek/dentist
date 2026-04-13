package handlers

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
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
	uploadPath      string
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
	uploadPath      string,
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
		uploadPath:      uploadPath,
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

	jsonBytes, err := json.MarshalIndent(snapshot.Data, "", "  ")
	if err != nil {
		sendInternalError(w, "Failed to marshal snapshot")
		return
	}

	var buf bytes.Buffer
	zw := zip.NewWriter(&buf)

	// Add snapshot.json
	fw, _ := zw.Create("snapshot.json")
	fw.Write(jsonBytes)

	// Add images referenced by gallery_images[*].filename
	if raw, ok := snapshot.Data["gallery_images"]; ok {
		var images []struct {
			Filename string `json:"filename"`
		}
		if b, err := json.Marshal(raw); err == nil {
			json.Unmarshal(b, &images)
		}
		for _, img := range images {
			if img.Filename == "" {
				continue
			}
			data, err := os.ReadFile(filepath.Join(h.uploadPath, img.Filename))
			if err != nil {
				continue // skip files missing from disk — don't fail the whole export
			}
			if fw, err := zw.Create("images/" + img.Filename); err == nil {
				fw.Write(data)
			}
		}
	}
	zw.Close()

	filename := fmt.Sprintf("snapshot-%d.zip", snapshot.ID)
	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename))
	w.WriteHeader(http.StatusOK)
	w.Write(buf.Bytes())
}

func (h *AdminSnapshotsHandler) importSnapshot(w http.ResponseWriter, r *http.Request) {
	if strings.Contains(r.Header.Get("Content-Type"), "multipart/form-data") {
		h.importSnapshotZip(w, r)
	} else {
		h.importSnapshotJSON(w, r)
	}
}

func (h *AdminSnapshotsHandler) importSnapshotJSON(w http.ResponseWriter, r *http.Request) {
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

func (h *AdminSnapshotsHandler) importSnapshotZip(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(200 << 20); err != nil {
		sendBadRequest(w, "Failed to parse form")
		return
	}
	file, _, err := r.FormFile("file")
	if err != nil {
		sendBadRequest(w, "Missing file field")
		return
	}
	defer file.Close()

	zipBytes, err := io.ReadAll(file)
	if err != nil {
		sendInternalError(w, "Failed to read file")
		return
	}

	zr, err := zip.NewReader(bytes.NewReader(zipBytes), int64(len(zipBytes)))
	if err != nil {
		sendBadRequest(w, "Invalid ZIP file")
		return
	}

	// Parse snapshot.json from the ZIP
	var jsonData datatypes.JSONMap
	for _, f := range zr.File {
		if f.Name != "snapshot.json" {
			continue
		}
		rc, err := f.Open()
		if err != nil {
			sendInternalError(w, "Failed to read snapshot.json")
			return
		}
		data, _ := io.ReadAll(rc)
		rc.Close()
		if err := json.Unmarshal(data, &jsonData); err != nil {
			sendBadRequest(w, "Invalid snapshot.json")
			return
		}
		break
	}
	if jsonData == nil {
		sendBadRequest(w, "snapshot.json not found in ZIP")
		return
	}

	if err := repository.ValidateSnapshotData(jsonData); err != nil {
		sendBadRequest(w, fmt.Sprintf("Invalid snapshot data: %v", err))
		return
	}

	// Count gallery image filenames referenced in the snapshot
	var galleryFilenames []string
	if raw, ok := jsonData["gallery_images"]; ok {
		var imgs []struct {
			Filename string `json:"filename"`
		}
		if b, err := json.Marshal(raw); err == nil {
			json.Unmarshal(b, &imgs)
		}
		for _, img := range imgs {
			if img.Filename != "" {
				galleryFilenames = append(galleryFilenames, img.Filename)
			}
		}
	}

	// Extract images/ to uploadPath
	if err := os.MkdirAll(h.uploadPath, 0755); err != nil {
		sendInternalError(w, "Failed to prepare upload directory")
		return
	}
	extracted := 0
	for _, f := range zr.File {
		if !strings.HasPrefix(f.Name, "images/") || f.FileInfo().IsDir() {
			continue
		}
		filename := filepath.Base(f.Name)
		if filename == "" || filename == "." {
			continue
		}
		rc, err := f.Open()
		if err != nil {
			continue
		}
		data, _ := io.ReadAll(rc)
		rc.Close()
		if err := os.WriteFile(filepath.Join(h.uploadPath, filename), data, 0644); err == nil {
			extracted++
		}
	}

	// If ?restore=true, restore DB
	if r.URL.Query().Get("restore") == "true" {
		if err := h.snapshotRepo.RestoreData(jsonData); err != nil {
			sendInternalError(w, fmt.Sprintf("Failed to restore: %v", err))
			return
		}
	}

	name := r.FormValue("name")
	if name == "" {
		name = "Imported snapshot"
	}
	snapshot := &models.Snapshot{
		Name:        name,
		Description: r.FormValue("description"),
		Data:        jsonData,
	}
	if err := h.snapshotRepo.Create(snapshot); err != nil {
		sendInternalError(w, "Failed to save imported snapshot")
		return
	}

	type importResult struct {
		*models.Snapshot
		ImagesExtracted int `json:"images_extracted"`
		ImagesTotal     int `json:"images_total"`
	}
	sendCreated(w, importResult{
		Snapshot:        snapshot,
		ImagesExtracted: extracted,
		ImagesTotal:     len(galleryFilenames),
	})
}
