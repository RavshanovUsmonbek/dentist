package repository

import (
	"time"

	"github.com/usmonbek/dentist-backend/internal/models"

	"gorm.io/gorm"
)

// AdminRepository handles database operations for admin users
type AdminRepository struct {
	db *gorm.DB
}

// NewAdminRepository creates a new AdminRepository
func NewAdminRepository(db *gorm.DB) *AdminRepository {
	return &AdminRepository{db: db}
}

// FindByUsername finds an admin user by username
func (r *AdminRepository) FindByUsername(username string) (*models.AdminUser, error) {
	var user models.AdminUser
	err := r.db.Where("username = ? AND active = ?", username, true).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByID finds an admin user by ID
func (r *AdminRepository) FindByID(id uint) (*models.AdminUser, error) {
	var user models.AdminUser
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByEmail finds an admin user by email
func (r *AdminRepository) FindByEmail(email string) (*models.AdminUser, error) {
	var user models.AdminUser
	err := r.db.Where("email = ? AND active = ?", email, true).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// Create creates a new admin user
func (r *AdminRepository) Create(user *models.AdminUser) error {
	return r.db.Create(user).Error
}

// Update updates an admin user
func (r *AdminRepository) Update(user *models.AdminUser) error {
	return r.db.Save(user).Error
}

// UpdateLastLogin updates the last_login timestamp for an admin user
func (r *AdminRepository) UpdateLastLogin(id uint) error {
	return r.db.Model(&models.AdminUser{}).Where("id = ?", id).Update("last_login", time.Now()).Error
}

// FindAll returns all admin users
func (r *AdminRepository) FindAll() ([]models.AdminUser, error) {
	var users []models.AdminUser
	err := r.db.Order("created_at DESC").Find(&users).Error
	return users, err
}

// Delete soft deletes an admin user by setting active to false
func (r *AdminRepository) Delete(id uint) error {
	return r.db.Model(&models.AdminUser{}).Where("id = ?", id).Update("active", false).Error
}
