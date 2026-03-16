package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
)

// JSONResponse is a generic response structure
type JSONResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

// sendJSON sends a JSON response with the given status code
func sendJSON(w http.ResponseWriter, data interface{}, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

// sendSuccess sends a success response with data
func sendSuccess(w http.ResponseWriter, data interface{}) {
	response := JSONResponse{
		Success: true,
		Data:    data,
	}
	sendJSON(w, response, http.StatusOK)
}

// sendSuccessMessage sends a success response with a message
func sendSuccessMessage(w http.ResponseWriter, message string) {
	response := JSONResponse{
		Success: true,
		Message: message,
	}
	sendJSON(w, response, http.StatusOK)
}

// sendCreated sends a 201 Created response with data
func sendCreated(w http.ResponseWriter, data interface{}) {
	response := JSONResponse{
		Success: true,
		Data:    data,
	}
	sendJSON(w, response, http.StatusCreated)
}

// sendError sends an error response with the given status code
func sendError(w http.ResponseWriter, message string, statusCode int) {
	response := JSONResponse{
		Success: false,
		Error:   message,
	}
	sendJSON(w, response, statusCode)
}

// sendBadRequest sends a 400 Bad Request error
func sendBadRequest(w http.ResponseWriter, message string) {
	sendError(w, message, http.StatusBadRequest)
}

// sendUnauthorized sends a 401 Unauthorized error
func sendUnauthorized(w http.ResponseWriter, message string) {
	sendError(w, message, http.StatusUnauthorized)
}

// sendNotFound sends a 404 Not Found error
func sendNotFound(w http.ResponseWriter, message string) {
	sendError(w, message, http.StatusNotFound)
}

// sendInternalError sends a 500 Internal Server Error
func sendInternalError(w http.ResponseWriter, message string) {
	sendError(w, message, http.StatusInternalServerError)
}

// sendMethodNotAllowed sends a 405 Method Not Allowed error
func sendMethodNotAllowed(w http.ResponseWriter) {
	sendError(w, "Method not allowed", http.StatusMethodNotAllowed)
}

// parseIDFromPath extracts the ID from the URL path
// e.g., /api/admin/services/123 -> 123
func parseIDFromPath(path string) (uint, error) {
	parts := strings.Split(strings.TrimSuffix(path, "/"), "/")
	if len(parts) == 0 {
		return 0, strconv.ErrSyntax
	}
	idStr := parts[len(parts)-1]
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return 0, err
	}
	return uint(id), nil
}

// decodeJSON decodes JSON from request body into the given interface
func decodeJSON(r *http.Request, v interface{}) error {
	return json.NewDecoder(r.Body).Decode(v)
}
