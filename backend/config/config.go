package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port            string
	FrontendURL     string
	DatabaseURL     string
	JWTSecret       string
	JWTExpiration   string
	SMTPHost        string
	SMTPPort        string
	SMTPUsername    string
	SMTPPassword    string
	EmailRecipient  string
	UploadPath      string
	UploadURLPrefix string
}

func Load() *Config {
	// Load .env file if it exists (optional in production)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	return &Config{
		Port:            getEnv("PORT", "8080"),
		FrontendURL:     getEnv("FRONTEND_URL", "http://localhost:5173"),
		DatabaseURL:     getEnv("DATABASE_URL", ""),
		JWTSecret:       getEnv("JWT_SECRET", ""),
		JWTExpiration:   getEnv("JWT_EXPIRATION", "24h"),
		SMTPHost:        getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:        getEnv("SMTP_PORT", "587"),
		SMTPUsername:    getEnv("SMTP_USERNAME", ""),
		SMTPPassword:    getEnv("SMTP_PASSWORD", ""),
		EmailRecipient:  getEnv("EMAIL_RECIPIENT", ""),
		UploadPath:      getEnv("UPLOAD_PATH", "./uploads"),
		UploadURLPrefix: getEnv("UPLOAD_URL_PREFIX", "/uploads"),
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
