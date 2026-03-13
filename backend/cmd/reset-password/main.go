package main

import (
	"fmt"
	"log"
	"os"

	"github.com/usmonbek/dentist-backend/config"
	"github.com/usmonbek/dentist-backend/internal/database"
	"github.com/usmonbek/dentist-backend/internal/models"
	"github.com/usmonbek/dentist-backend/internal/repository"
	"github.com/usmonbek/dentist-backend/internal/services"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Load config
	cfg := config.Load()

	if cfg.DatabaseURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	// Connect to database
	dbConfig := database.Config{
		DatabaseURL: cfg.DatabaseURL,
	}
	if err := database.Connect(dbConfig); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	db := database.GetDB()
	adminRepo := repository.NewAdminRepository(db)

	// Get username from args or use default
	username := "admin"
	if len(os.Args) > 1 {
		username = os.Args[1]
	}

	// Get password from args or use default
	password := "admin123"
	if len(os.Args) > 2 {
		password = os.Args[2]
	}

	fmt.Printf("Resetting password for user: %s\n", username)

	// Find user
	user, err := adminRepo.FindByUsername(username)
	if err != nil {
		// User doesn't exist, create it
		fmt.Printf("User '%s' not found, creating new admin user...\n", username)

		// Hash password
		hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			log.Fatalf("Failed to hash password: %v", err)
		}

		newUser := &models.AdminUser{
			Username:     username,
			Email:        fmt.Sprintf("%s@dentist.local", username),
			PasswordHash: string(hash),
			FullName:     "Administrator",
			Active:       true,
		}

		if err := adminRepo.Create(newUser); err != nil {
			log.Fatalf("Failed to create admin user: %v", err)
		}

		fmt.Printf("✓ Admin user '%s' created successfully\n", username)
		fmt.Printf("  Username: %s\n", username)
		fmt.Printf("  Password: %s\n", password)
		return
	}

	// User exists, update password
	fmt.Printf("Updating password for existing user '%s'...\n", username)

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	user.PasswordHash = string(hash)

	if err := adminRepo.Update(user); err != nil {
		log.Fatalf("Failed to update admin user: %v", err)
	}

	fmt.Printf("✓ Password updated successfully\n")
	fmt.Printf("  Username: %s\n", username)
	fmt.Printf("  Password: %s\n", password)

	// Verify the password works
	authService := services.NewAuthService(cfg.JWTSecret, 0)
	if authService.CheckPassword(user.PasswordHash, password) {
		fmt.Printf("✓ Password verification successful\n")
	} else {
		fmt.Printf("✗ WARNING: Password verification failed!\n")
	}
}