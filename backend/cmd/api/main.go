package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/usmonbek/dentist-backend/config"
	"github.com/usmonbek/dentist-backend/internal/handlers"
	"github.com/usmonbek/dentist-backend/internal/middleware"
	"github.com/usmonbek/dentist-backend/internal/services"
)

func main() {
	cfg := config.Load()

	emailService, err := services.NewEmailService(
		cfg.SMTPHost,
		cfg.SMTPPort,
		cfg.SMTPUsername,
		cfg.SMTPPassword,
		cfg.EmailRecipient,
	)
	if err != nil {
		log.Fatalf("Failed to initialize email service: %v", err)
	}

	validator := services.NewValidator()

	contactHandler := handlers.NewContactHandler(emailService, validator)

	mux := http.NewServeMux()

	mux.HandleFunc("/api/health", handlers.HandleHealth)
	mux.HandleFunc("/api/contact", contactHandler.HandleContact)

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

	log.Println("Server stopped")
}
