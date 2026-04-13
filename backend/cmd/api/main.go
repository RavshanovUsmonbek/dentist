package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/usmonbek/dentist-backend/config"
	"github.com/usmonbek/dentist-backend/internal/database"
	"github.com/usmonbek/dentist-backend/internal/handlers"
	"github.com/usmonbek/dentist-backend/internal/middleware"
	"github.com/usmonbek/dentist-backend/internal/repository"
	"github.com/usmonbek/dentist-backend/internal/services"
)

func main() {
	cfg := config.Load()

	// Initialize database
	if cfg.DatabaseURL == "" {
		log.Println("WARNING: DATABASE_URL not set, running without database")
	} else {
		dbConfig := database.Config{
			DatabaseURL: cfg.DatabaseURL,
		}
		if err := database.Connect(dbConfig); err != nil {
			log.Fatalf("Failed to connect to database: %v", err)
		}
		log.Println("Connected to database")

		// Run migrations
		if err := database.RunMigrations(cfg.DatabaseURL); err != nil {
			log.Printf("Warning: Migration error: %v", err)
		}
	}

	// Initialize services
	// NOTE: Email service replaced with Telegram - keeping this commented for reference
	// emailService, err := services.NewEmailService(
	// 	cfg.SMTPHost,
	// 	cfg.SMTPPort,
	// 	cfg.SMTPUsername,
	// 	cfg.SMTPPassword,
	// 	cfg.EmailRecipient,
	// )
	// if err != nil {
	// 	log.Printf("Warning: Email service not configured: %v", err)
	// }

	validator := services.NewValidator()

	// Initialize auth service
	var authService *services.AuthService
	if cfg.JWTSecret != "" {
		expiration, err := services.ParseExpiration(cfg.JWTExpiration)
		if err != nil {
			expiration = 24 * time.Hour
		}
		authService = services.NewAuthService(cfg.JWTSecret, expiration)
		log.Println("JWT authentication enabled")
	} else {
		log.Println("WARNING: JWT_SECRET not set, admin endpoints will not work")
	}

	// Initialize repositories
	db := database.GetDB()
	adminRepo := repository.NewAdminRepository(db)
	serviceRepo := repository.NewServiceRepository(db)
	testimonialRepo := repository.NewTestimonialRepository(db)
	galleryRepo := repository.NewGalleryRepository(db)
	galleryCategoryRepo := repository.NewGalleryCategoryRepository(db)
	locationRepo := repository.NewLocationRepository(db)
	contactRepo := repository.NewContactRepository(db)
	settingsRepo := repository.NewSettingsRepository(db)

	// Initialize Telegram service (credentials read from DB settings at send-time)
	telegramService := services.NewTelegramService(settingsRepo)
	log.Println("Telegram notifications enabled (configure bot token and chat ID in admin panel)")

	// Initialize handlers
	contactHandler := handlers.NewContactHandler(contactRepo, telegramService, validator)
	uploadHandler := handlers.NewUploadHandler(cfg.UploadPath, cfg.UploadURLPrefix, 10<<20) // 10MB max
	publicHandler := handlers.NewPublicHandler(serviceRepo, testimonialRepo, galleryRepo, galleryCategoryRepo, locationRepo, settingsRepo, validator)

	// Admin handlers
	adminAuthHandler := handlers.NewAdminAuthHandler(adminRepo, authService, validator)
	adminServicesHandler := handlers.NewAdminServicesHandler(serviceRepo, validator)
	adminTestimonialsHandler := handlers.NewAdminTestimonialsHandler(testimonialRepo, validator)
	adminGalleryHandler := handlers.NewAdminGalleryHandler(galleryRepo, validator)
	adminGalleryCategoriesHandler := handlers.NewAdminGalleryCategoriesHandler(galleryCategoryRepo, validator)
	adminLocationsHandler := handlers.NewAdminLocationsHandler(locationRepo, validator)
	adminContactsHandler := handlers.NewAdminContactsHandler(contactRepo)
	adminSettingsHandler := handlers.NewAdminSettingsHandler(settingsRepo)

	snapshotRepo := repository.NewSnapshotRepository(db)
	adminSnapshotsHandler := handlers.NewAdminSnapshotsHandler(
		snapshotRepo, serviceRepo, testimonialRepo,
		galleryRepo, galleryCategoryRepo, locationRepo,
		settingsRepo, validator,
		cfg.UploadPath,
	)

	// Setup router
	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("/api/health", handlers.HandleHealth)

	// Public endpoints
	mux.HandleFunc("/api/contact", contactHandler.HandleContact)
	mux.HandleFunc("/api/services", publicHandler.HandleServices)
	mux.HandleFunc("/api/testimonials", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			publicHandler.HandleTestimonialSubmit(w, r)
		} else {
			publicHandler.HandleTestimonials(w, r)
		}
	})
	mux.HandleFunc("/api/gallery", publicHandler.HandleGallery)
	mux.HandleFunc("/api/gallery-categories", publicHandler.HandleGalleryCategories)
	mux.HandleFunc("/api/locations", publicHandler.HandleLocations)
	mux.HandleFunc("/api/settings", publicHandler.HandleSettings)
	mux.HandleFunc("/api/content/", publicHandler.HandleContent)

	// Admin auth (no auth required for login)
	mux.HandleFunc("/api/admin/login", adminAuthHandler.HandleLogin)

	// Admin endpoints (auth required)
	if authService != nil {
		// Admin user info
		mux.HandleFunc("/api/admin/me", middleware.AuthFunc(authService, adminAuthHandler.HandleMe))

		// Admin services
		mux.HandleFunc("/api/admin/services", middleware.AuthFunc(authService, adminServicesHandler.HandleServices))
		mux.Handle("/api/admin/services/", middleware.Auth(authService)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			adminServicesHandler.HandleService(w, r)
		})))

		// Admin testimonials
		mux.HandleFunc("/api/admin/testimonials", middleware.AuthFunc(authService, adminTestimonialsHandler.HandleTestimonials))
		mux.HandleFunc("/api/admin/testimonials/pending", middleware.AuthFunc(authService, adminTestimonialsHandler.HandlePending))
		mux.Handle("/api/admin/testimonials/", middleware.Auth(authService)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			path := r.URL.Path
			if strings.HasSuffix(path, "/approve") {
				adminTestimonialsHandler.HandleApprove(w, r)
			} else if strings.HasSuffix(path, "/reject") {
				adminTestimonialsHandler.HandleReject(w, r)
			} else {
				adminTestimonialsHandler.HandleTestimonial(w, r)
			}
		})))

		// Admin gallery
		mux.HandleFunc("/api/admin/gallery", middleware.AuthFunc(authService, adminGalleryHandler.HandleGallery))
		mux.Handle("/api/admin/gallery/", middleware.Auth(authService)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			adminGalleryHandler.HandleGalleryImage(w, r)
		})))

		// Admin gallery categories
		mux.HandleFunc("/api/admin/gallery-categories", middleware.AuthFunc(authService, adminGalleryCategoriesHandler.HandleGalleryCategories))
		mux.Handle("/api/admin/gallery-categories/", middleware.Auth(authService)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			adminGalleryCategoriesHandler.HandleGalleryCategory(w, r)
		})))

		// Admin locations
		mux.HandleFunc("/api/admin/locations", middleware.AuthFunc(authService, adminLocationsHandler.HandleLocations))
		mux.Handle("/api/admin/locations/", middleware.Auth(authService)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			adminLocationsHandler.HandleLocation(w, r)
		})))

		// Admin contacts
		mux.HandleFunc("/api/admin/contacts", middleware.AuthFunc(authService, adminContactsHandler.HandleContacts))
		mux.HandleFunc("/api/admin/contacts/stats", middleware.AuthFunc(authService, adminContactsHandler.HandleContactsStats))
		mux.Handle("/api/admin/contacts/", middleware.Auth(authService)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Don't match /api/admin/contacts/stats
			if strings.HasSuffix(r.URL.Path, "/stats") {
				return
			}
			adminContactsHandler.HandleContact(w, r)
		})))

		// Admin settings
		mux.HandleFunc("/api/admin/settings", middleware.AuthFunc(authService, adminSettingsHandler.HandleSettings))
		mux.HandleFunc("/api/admin/content", middleware.AuthFunc(authService, adminSettingsHandler.HandleAllContent))
		mux.Handle("/api/admin/content/", middleware.Auth(authService)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			adminSettingsHandler.HandleContent(w, r)
		})))

		// Snapshots — /import must be registered before the wildcard /:id
		mux.HandleFunc("/api/admin/snapshots", middleware.AuthFunc(authService, adminSnapshotsHandler.HandleSnapshots))
		mux.HandleFunc("/api/admin/snapshots/import", middleware.AuthFunc(authService, adminSnapshotsHandler.HandleSnapshotImport))
		mux.Handle("/api/admin/snapshots/", middleware.Auth(authService)(http.HandlerFunc(adminSnapshotsHandler.HandleSnapshotByID)))

		// File upload
		mux.HandleFunc("/api/admin/upload", middleware.AuthFunc(authService, uploadHandler.HandleUpload))
	}

	// Serve uploaded files
	mux.Handle(cfg.UploadURLPrefix+"/", uploadHandler.ServeUploads())

	// Apply middleware
	handler := middleware.Logging(middleware.CORS(cfg.FrontendURL)(mux))

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("Server starting on port %s", cfg.Port)
		log.Printf("Frontend URL: %s", cfg.FrontendURL)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Server shutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	// Close database connection
	database.Close()

	log.Println("Server stopped")
}
