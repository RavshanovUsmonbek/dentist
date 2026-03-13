package repository

import (
	"github.com/usmonbek/dentist-backend/internal/models"

	"gorm.io/gorm"
)

// ContactRepository handles database operations for contact submissions
type ContactRepository struct {
	db *gorm.DB
}

// NewContactRepository creates a new ContactRepository
func NewContactRepository(db *gorm.DB) *ContactRepository {
	return &ContactRepository{db: db}
}

// FindAll returns all contact submissions ordered by created_at (newest first)
func (r *ContactRepository) FindAll() ([]models.ContactSubmission, error) {
	var contacts []models.ContactSubmission
	err := r.db.Order("created_at DESC").Find(&contacts).Error
	return contacts, err
}

// FindUnread returns only unread contact submissions
func (r *ContactRepository) FindUnread() ([]models.ContactSubmission, error) {
	var contacts []models.ContactSubmission
	err := r.db.Where("read = ?", false).Order("created_at DESC").Find(&contacts).Error
	return contacts, err
}

// FindByID finds a contact submission by ID
func (r *ContactRepository) FindByID(id uint) (*models.ContactSubmission, error) {
	var contact models.ContactSubmission
	err := r.db.First(&contact, id).Error
	if err != nil {
		return nil, err
	}
	return &contact, nil
}

// Create creates a new contact submission
func (r *ContactRepository) Create(contact *models.ContactSubmission) error {
	return r.db.Create(contact).Error
}

// MarkAsRead marks a contact submission as read
func (r *ContactRepository) MarkAsRead(id uint, read bool) error {
	return r.db.Model(&models.ContactSubmission{}).Where("id = ?", id).Update("read", read).Error
}

// UpdateNotes updates the notes field of a contact submission
func (r *ContactRepository) UpdateNotes(id uint, notes string) error {
	return r.db.Model(&models.ContactSubmission{}).Where("id = ?", id).Update("notes", notes).Error
}

// Delete deletes a contact submission by ID
func (r *ContactRepository) Delete(id uint) error {
	return r.db.Delete(&models.ContactSubmission{}, id).Error
}

// CountUnread returns the count of unread contact submissions
func (r *ContactRepository) CountUnread() (int64, error) {
	var count int64
	err := r.db.Model(&models.ContactSubmission{}).Where("read = ?", false).Count(&count).Error
	return count, err
}

// CountAll returns the total count of contact submissions
func (r *ContactRepository) CountAll() (int64, error) {
	var count int64
	err := r.db.Model(&models.ContactSubmission{}).Count(&count).Error
	return count, err
}
