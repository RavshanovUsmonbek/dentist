package handlers

import (
	"net/http"

	"github.com/usmonbek/dentist-backend/internal/repository"
)

// AdminContactsHandler handles admin contact submissions endpoints
type AdminContactsHandler struct {
	contactRepo *repository.ContactRepository
}

// NewAdminContactsHandler creates a new AdminContactsHandler
func NewAdminContactsHandler(contactRepo *repository.ContactRepository) *AdminContactsHandler {
	return &AdminContactsHandler{
		contactRepo: contactRepo,
	}
}

// HandleContacts handles GET /api/admin/contacts
func (h *AdminContactsHandler) HandleContacts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendMethodNotAllowed(w)
		return
	}

	contacts, err := h.contactRepo.FindAll()
	if err != nil {
		sendInternalError(w, "Failed to fetch contact submissions")
		return
	}
	sendSuccess(w, contacts)
}

// HandleContact handles GET/PATCH/DELETE /api/admin/contacts/:id
func (h *AdminContactsHandler) HandleContact(w http.ResponseWriter, r *http.Request) {
	id, err := parseIDFromPath(r.URL.Path)
	if err != nil {
		sendBadRequest(w, "Invalid contact ID")
		return
	}

	switch r.Method {
	case http.MethodGet:
		h.getContact(w, r, id)
	case http.MethodPatch:
		h.updateContact(w, r, id)
	case http.MethodDelete:
		h.deleteContact(w, r, id)
	default:
		sendMethodNotAllowed(w)
	}
}

func (h *AdminContactsHandler) getContact(w http.ResponseWriter, r *http.Request, id uint) {
	contact, err := h.contactRepo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Contact submission not found")
		return
	}
	sendSuccess(w, contact)
}

// ContactUpdateRequest represents a partial update to a contact
type ContactUpdateRequest struct {
	Read  *bool   `json:"read,omitempty"`
	Notes *string `json:"notes,omitempty"`
}

func (h *AdminContactsHandler) updateContact(w http.ResponseWriter, r *http.Request, id uint) {
	contact, err := h.contactRepo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Contact submission not found")
		return
	}

	var req ContactUpdateRequest
	if err := decodeJSON(r, &req); err != nil {
		sendBadRequest(w, "Invalid request body")
		return
	}

	if req.Read != nil {
		if err := h.contactRepo.MarkAsRead(id, *req.Read); err != nil {
			sendInternalError(w, "Failed to update contact")
			return
		}
		contact.Read = *req.Read
	}

	if req.Notes != nil {
		if err := h.contactRepo.UpdateNotes(id, *req.Notes); err != nil {
			sendInternalError(w, "Failed to update contact")
			return
		}
		contact.Notes = *req.Notes
	}

	sendSuccess(w, contact)
}

func (h *AdminContactsHandler) deleteContact(w http.ResponseWriter, r *http.Request, id uint) {
	_, err := h.contactRepo.FindByID(id)
	if err != nil {
		sendNotFound(w, "Contact submission not found")
		return
	}

	if err := h.contactRepo.Delete(id); err != nil {
		sendInternalError(w, "Failed to delete contact submission")
		return
	}

	sendSuccessMessage(w, "Contact submission deleted successfully")
}

// HandleContactsStats handles GET /api/admin/contacts/stats
func (h *AdminContactsHandler) HandleContactsStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendMethodNotAllowed(w)
		return
	}

	totalCount, err := h.contactRepo.CountAll()
	if err != nil {
		sendInternalError(w, "Failed to fetch contact stats")
		return
	}

	unreadCount, err := h.contactRepo.CountUnread()
	if err != nil {
		sendInternalError(w, "Failed to fetch contact stats")
		return
	}

	stats := map[string]int64{
		"total":  totalCount,
		"unread": unreadCount,
		"read":   totalCount - unreadCount,
	}

	sendSuccess(w, stats)
}
