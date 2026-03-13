package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// UploadHandler handles file upload endpoints
type UploadHandler struct {
	uploadPath      string
	uploadURLPrefix string
	maxFileSize     int64
	allowedTypes    map[string]bool
}

// NewUploadHandler creates a new UploadHandler
func NewUploadHandler(uploadPath, uploadURLPrefix string, maxFileSize int64) *UploadHandler {
	return &UploadHandler{
		uploadPath:      uploadPath,
		uploadURLPrefix: uploadURLPrefix,
		maxFileSize:     maxFileSize,
		allowedTypes: map[string]bool{
			".jpg":  true,
			".jpeg": true,
			".png":  true,
			".gif":  true,
			".webp": true,
			".svg":  true,
		},
	}
}

// HandleUpload handles POST /api/admin/upload
func (h *UploadHandler) HandleUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendMethodNotAllowed(w)
		return
	}

	// Limit request body size
	r.Body = http.MaxBytesReader(w, r.Body, h.maxFileSize)

	// Parse multipart form
	if err := r.ParseMultipartForm(h.maxFileSize); err != nil {
		sendBadRequest(w, "File too large or invalid form data")
		return
	}

	// Get file from form
	file, header, err := r.FormFile("file")
	if err != nil {
		sendBadRequest(w, "Failed to read file")
		return
	}
	defer file.Close()

	// Validate file extension
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !h.allowedTypes[ext] {
		sendBadRequest(w, "File type not allowed. Allowed types: jpg, jpeg, png, gif, webp, svg")
		return
	}

	// Generate unique filename
	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	filePath := filepath.Join(h.uploadPath, filename)

	// Ensure upload directory exists
	if err := os.MkdirAll(h.uploadPath, 0755); err != nil {
		sendInternalError(w, "Failed to create upload directory")
		return
	}

	// Create destination file
	dst, err := os.Create(filePath)
	if err != nil {
		sendInternalError(w, "Failed to save file")
		return
	}
	defer dst.Close()

	// Copy file contents
	if _, err := io.Copy(dst, file); err != nil {
		sendInternalError(w, "Failed to save file")
		return
	}

	// Return the URL
	url := h.uploadURLPrefix + "/" + filename
	response := map[string]string{
		"url":      url,
		"filename": filename,
	}

	sendSuccess(w, response)
}

// ServeUploads creates a handler to serve uploaded files
func (h *UploadHandler) ServeUploads() http.Handler {
	return http.StripPrefix(h.uploadURLPrefix, http.FileServer(http.Dir(h.uploadPath)))
}
