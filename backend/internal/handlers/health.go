package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/usmonbek/dentist-backend/internal/models"
)

func HandleHealth(w http.ResponseWriter, r *http.Request) {
	response := models.HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now(),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
