# Dentist Website - Backend API

Go REST API for the dentist profile website contact form.

## Overview

This backend provides a simple REST API with two endpoints:
- Health check
- Contact form submission (sends email via SMTP)

## Tech Stack

- **Go 1.21+**
- **net/http** - Standard library HTTP server
- **godotenv** - Environment variable management
- **go-playground/validator** - Input validation
- **gomail** - SMTP email sending

## Setup

### 1. Install Dependencies

```bash
go mod download
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=8080
FRONTEND_URL=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_RECIPIENT=dentist@example.com
```

#### Gmail Setup

If using Gmail:
1. Go to https://myaccount.google.com/apppasswords
2. Create an App Password for "Mail"
3. Use that password in `SMTP_PASSWORD`

**Note:** Regular Gmail passwords won't work - you must use an App Password.

### 3. Run the Server

```bash
go run cmd/api/main.go
```

Server will start on http://localhost:8080

## API Documentation

### Health Check

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-13T12:00:00Z"
}
```

### Submit Contact Form

**Endpoint:** `POST /api/contact`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "message": "I would like to schedule an appointment."
}
```

**Validation Rules:**
- `name`: Required, 2-100 characters
- `email`: Required, valid email format
- `phone`: Optional, 7-20 characters
- `message`: Required, 10-1000 characters

**Success Response (200):**
```json
{
  "success": true,
  "message": "Thank you for contacting us! We'll get back to you soon."
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "name is required; email must be a valid email address"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "error": "Failed to send message. Please try again later."
}
```

## Project Structure

```
backend/
├── cmd/api/
│   └── main.go                 # Application entry point
├── config/
│   └── config.go               # Configuration management
├── internal/
│   ├── handlers/
│   │   ├── health.go           # Health check handler
│   │   └── contact.go          # Contact form handler
│   ├── middleware/
│   │   ├── cors.go             # CORS middleware
│   │   └── logging.go          # Request logging
│   ├── models/
│   │   └── contact.go          # Data models
│   └── services/
│       ├── email.go            # Email service
│       └── validator.go        # Input validation
├── .env.example                # Environment template
├── go.mod                      # Go module file
└── README.md                   # This file
```

## Development

### Hot Reload (Optional)

Install Air for hot reloading:

```bash
go install github.com/air-verse/air@latest
air
```

### Testing

Test the health endpoint:

```bash
curl http://localhost:8080/api/health
```

Test the contact endpoint:

```bash
curl -X POST http://localhost:8080/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "message": "This is a test message."
  }'
```

### Code Quality

Format code:
```bash
go fmt ./...
```

Lint code:
```bash
go vet ./...
```

## Building for Production

### Build Binary

```bash
go build -o bin/api cmd/api/main.go
```

### Build for Linux (from Mac/Windows)

```bash
GOOS=linux GOARCH=amd64 go build -o bin/api cmd/api/main.go
```

### Run Production Binary

```bash
./bin/api
```

## Deployment

### Option 1: Traditional VPS

1. Build the binary for Linux
2. Upload binary and `.env` to server
3. Run with systemd or supervisor

Example systemd service:

```ini
[Unit]
Description=Dentist API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/dentist
EnvironmentFile=/var/www/dentist/.env
ExecStart=/var/www/dentist/api
Restart=always

[Install]
WantedBy=multi-user.target
```

### Option 2: Platform as a Service

**Railway.app:**
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Railway auto-detects Go and deploys

**Render.com:**
1. Create new Web Service
2. Connect repository
3. Build command: `go build -o api cmd/api/main.go`
4. Start command: `./api`

**Fly.io:**
```bash
fly launch
fly secrets set SMTP_PASSWORD=your-password
fly deploy
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USERNAME` | SMTP username (email) | `your-email@gmail.com` |
| `SMTP_PASSWORD` | SMTP password/app password | `your-app-password` |
| `EMAIL_RECIPIENT` | Email to receive form submissions | `dentist@example.com` |

## Troubleshooting

### Email Not Sending

**Check SMTP credentials:**
- Verify `SMTP_USERNAME` and `SMTP_PASSWORD` are correct
- For Gmail, ensure you're using an App Password, not regular password

**Check network:**
- Ensure firewall allows outbound connections on SMTP port (587 or 465)
- Some hosting providers block SMTP ports

**Check logs:**
```bash
# Look for error messages in console output
```

### CORS Errors

- Ensure `FRONTEND_URL` matches your frontend's exact URL
- Include protocol (http:// or https://)
- Don't include trailing slash

### Port Already in Use

```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=8081 go run cmd/api/main.go
```

## Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use environment variables** - Don't hardcode credentials
3. **Enable HTTPS in production** - Use reverse proxy (Nginx) or platform SSL
4. **Rate limiting** - Consider adding rate limiting for production
5. **Input validation** - Already implemented with validator
6. **CORS configuration** - Only allow your frontend domain

## License

Apache License 2.0
