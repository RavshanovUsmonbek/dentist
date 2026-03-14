package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/usmonbek/dentist-backend/internal/models"
	"github.com/usmonbek/dentist-backend/internal/repository"
	"github.com/usmonbek/dentist-backend/internal/services"
)

type ContactHandler struct {
	contactRepo      *repository.ContactRepository
	telegramService  *services.TelegramService
	validator        *services.Validator
}

func NewContactHandler(contactRepo *repository.ContactRepository, telegramService *services.TelegramService, validator *services.Validator) *ContactHandler {
	return &ContactHandler{
		contactRepo:     contactRepo,
		telegramService: telegramService,
		validator:       validator,
	}
}

func (h *ContactHandler) HandleContact(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var contact models.ContactRequest
	if err := json.NewDecoder(r.Body).Decode(&contact); err != nil {
		sendBadRequest(w, "Invalid request body")
		return
	}

	contact.Timestamp = time.Now()

	if err := h.validator.Validate(&contact); err != nil {
		sendError(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Create contact submission entity
	submission := &models.ContactSubmission{
		Name:    contact.Name,
		Email:   contact.Email,
		Phone:   contact.Phone,
		Message: contact.Message,
		Read:    false,
	}

	// Save to database (PRIMARY OPERATION - must succeed)
	if err := h.contactRepo.Create(submission); err != nil {
		log.Printf("Failed to save contact submission: %v", err)
		sendInternalError(w, "Failed to save contact submission")
		return
	}

	// Send Telegram notification (NON-BLOCKING - errors logged but don't fail request)
	go func() {
		err := h.telegramService.SendContactNotification(
			submission.Name,
			submission.Email,
			submission.Phone,
			submission.Message,
		)
		if err != nil {
			log.Printf("Failed to send Telegram notification: %v", err)
		}
	}()

	sendSuccessMessage(w, "Thank you for contacting us! We'll get back to you soon.")
}

