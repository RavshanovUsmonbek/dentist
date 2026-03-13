# Dentist Profile Website

A modern, professional single-page dentist profile website with a Go REST API backend and React frontend. Features a contact form, service listings, patient testimonials, and photo gallery.

## Tech Stack

### Backend
- **Go (Golang)** - Fast, efficient REST API
- **SMTP Email** - Contact form submissions via email
- **Environment-based config** - Secure configuration management

### Frontend
- **React** - Modern component-based UI framework
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Icons** - Professional icon library

## Features

- **Hero Section** - Eye-catching landing with call-to-action
- **About Section** - Dentist profile with credentials and experience
- **Services Section** - Comprehensive list of dental services
- **Photo Gallery** - Showcase of office and equipment
- **Patient Testimonials** - Reviews and ratings
- **Contact Form** - Functional form with email integration
- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Professional Medical Theme** - Blues, grays, and clean design

## Prerequisites

- **Go 1.21+** - [Download](https://golang.org/dl/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** - Comes with Node.js

## Quick Start

### 1. Clone the Repository

```bash
cd /Users/usmonbek/WORK/dentist
```

### 2. Setup Backend

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your SMTP credentials
# For Gmail, use an App Password: https://support.google.com/accounts/answer/185833

# Install dependencies
go mod download

# Run the backend
go run cmd/api/main.go
```

Backend will run on http://localhost:8080

### 3. Setup Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

Frontend will run on http://localhost:5173

### 4. Access the Website

Open your browser and navigate to:
```
http://localhost:5173
```

## Project Structure

```
dentist/
├── backend/              # Go REST API
│   ├── cmd/api/          # Application entry point
│   ├── internal/         # Internal packages
│   │   ├── handlers/     # HTTP request handlers
│   │   ├── middleware/   # CORS, logging middleware
│   │   ├── models/       # Data models
│   │   └── services/     # Business logic (email, validation)
│   ├── config/           # Configuration management
│   └── .env.example      # Environment template
│
├── frontend/             # React SPA
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── layout/   # Header, Footer
│   │   │   ├── sections/ # Hero, About, Services, etc.
│   │   │   └── ui/       # Reusable UI components
│   │   ├── services/     # API client
│   │   └── data/         # Static data (services, testimonials)
│   ├── public/           # Static assets
│   └── .env.example      # Environment template
│
└── README.md             # This file
```

## Configuration

### Backend (.env)

Create `backend/.env`:

```env
PORT=8080
FRONTEND_URL=http://localhost:5173

# SMTP Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Where to send contact form submissions
EMAIL_RECIPIENT=dentist@example.com
```

### Frontend (.env.local)

Create `frontend/.env.local` (optional):

```env
VITE_API_URL=http://localhost:8080/api
```

## Development

### Backend Development

```bash
cd backend

# Run with hot reload (requires air)
air

# Or run normally
go run cmd/api/main.go

# Run tests
go test ./...

# Build for production
go build -o bin/api cmd/api/main.go
```

### Frontend Development

```bash
cd frontend

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/contact` - Submit contact form

### Contact Form API

**Endpoint:** `POST /api/contact`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "message": "I would like to schedule an appointment."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Thank you for contacting us! We'll get back to you soon."
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Customization

### Update Content

1. **Dentist Information** - Edit `frontend/src/components/sections/About.jsx`
2. **Services** - Edit `frontend/src/data/services.js`
3. **Testimonials** - Edit `frontend/src/data/testimonials.js`
4. **Contact Info** - Edit `frontend/src/components/sections/Contact.jsx` and `frontend/src/components/layout/Footer.jsx`
5. **Practice Name** - Search for "Smile Dental Care" and replace globally

### Update Colors

Edit `frontend/tailwind.config.js`:

```javascript
colors: {
  primary: {
    // Change these hex values to your brand colors
    500: '#0ea5e9',  // Main blue
    700: '#0369a1',  // Dark blue
    // ... other shades
  }
}
```

### Add Images

Place images in `frontend/public/images/`:
- `hero/` - Hero banner images
- `gallery/` - Office and equipment photos

Update image references in components.

## Deployment

### Backend Deployment

**Option 1: Traditional Server**

```bash
# Build binary
GOOS=linux GOARCH=amd64 go build -o api cmd/api/main.go

# Upload to server and run
./api
```

**Option 2: Platform as a Service**
- Railway.app
- Render.com
- Fly.io

### Frontend Deployment

**Option 1: Static Hosting**

```bash
npm run build
# Upload dist/ folder to:
# - Vercel
# - Netlify
# - Cloudflare Pages
```

**Configure Environment:**
- Set `VITE_API_URL` to your production backend URL

### DNS & SSL
- Point your domain to your server
- Use Let's Encrypt for free SSL certificates

## Troubleshooting

### Backend Issues

**Email not sending:**
- Check SMTP credentials in `.env`
- For Gmail, use an App Password, not your regular password
- Verify firewall allows SMTP ports (587 or 465)

**CORS errors:**
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check browser console for specific CORS error details

### Frontend Issues

**Tailwind styles not working:**
- Ensure you ran `npm install`
- Check `tailwind.config.js` content paths
- Restart dev server after config changes

**API calls failing:**
- Verify backend is running on port 8080
- Check Vite proxy configuration in `vite.config.js`
- Inspect browser network tab for error details

## License

Apache License 2.0

## Support

For questions or issues, please check the documentation in:
- `backend/README.md` - Backend-specific documentation
- `frontend/README.md` - Frontend-specific documentation
