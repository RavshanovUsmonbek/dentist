package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/usmonbek/dentist-backend/internal/models"
	"github.com/usmonbek/dentist-backend/internal/services"
)

type ContactHandler struct {
	emailService *services.EmailService
	validator    *services.Validator
}

func NewContactHandler(emailService *services.EmailService, validator *services.Validator) *ContactHandler {
	return &ContactHandler{
		emailService: emailService,
		validator:    validator,
	}
}

func (h *ContactHandler) HandleContact(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var contact models.ContactRequest
	if err := json.NewDecoder(r.Body).Decode(&contact); err != nil {
		sendErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	contact.Timestamp = time.Now()

	if err := h.validator.Validate(&contact); err != nil {
		sendErrorResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.emailService.SendContactEmail(&contact); err != nil {
		log.Printf("Failed to send email: %v", err)
		sendErrorResponse(w, "Failed to send message. Please try again later.", http.StatusInternalServerError)
		return
	}

	response := models.ContactResponse{
		Success: true,
		Message: "Thank you for contacting us! We'll get back to you soon.",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func sendErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	response := models.ContactResponse{
		Success: false,
		Error:   message,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(response)
}
