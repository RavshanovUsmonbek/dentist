# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack dentist website with:
- **Public website**: Single-page application showing services, testimonials, gallery, and contact form
- **Admin panel**: CMS for managing all website content dynamically (services, testimonials, gallery, settings, site content)
- **Backend**: Go REST API with PostgreSQL database using GORM ORM
- **Frontend**: React SPA with Tailwind CSS

Key architectural decision: The site has **two distinct applications** that share the same React codebase but have separate routing, contexts, and components.

## Development Commands

### Docker (Recommended - Simplified Single File)

**NOTE**: The Docker setup was recently simplified to use a single `docker-compose.yml` file.

```bash
# Development mode (default) - hot-reload enabled
docker compose up --build

# Stop containers
docker compose down

# Clean up everything including volumes
docker compose down -v && docker system prune -a --volumes -f

# View logs
docker compose logs -f              # All services
docker compose logs -f backend      # Backend only
docker compose logs -f frontend     # Frontend only

# Shell access
docker exec -it dentist_backend sh
docker exec -it dentist_frontend sh
docker exec -it dentist_postgres psql -U dentist_user -d dentist_db

# Production mode (uses Nginx reverse proxy)
docker compose --env-file .env.production --profile production up --build -d
```

**Important**: The old three-file Docker Compose setup (docker-compose.yml + docker-compose.dev.yml + docker-compose.prod.yml) has been replaced. If you see references to the old commands, use the new simplified commands above.

### Local Development (Without Docker)

```bash
# Backend (from backend/ directory)
go run cmd/api/main.go          # Run server
air                             # Run with hot-reload (requires air)
go test ./...                   # Run all tests
go build -o bin/api cmd/api/main.go  # Build binary

# Frontend (from frontend/ directory)
npm install                     # Install dependencies
npm run dev                     # Development server (http://localhost:5173)
npm run build                   # Production build
npm run lint                    # Lint code
```

### Database Migrations

Migrations are automatically run on backend startup. Manual commands:

```bash
# Inside backend container
docker exec -it dentist_backend sh
migrate -path ./migrations -database "$DATABASE_URL" up
migrate -path ./migrations -database "$DATABASE_URL" down 1

# Create new migration
migrate create -ext sql -dir ./migrations -seq <migration_name>
```

Migration files are in `backend/migrations/` with `.up.sql` and `.down.sql` pairs.

## Architecture

### Backend Architecture (Go)

**Entry Point**: `backend/cmd/api/main.go`

The application follows a **layered architecture**:

```
main.go (setup & routing)
    ↓
handlers/ (HTTP request handling)
    ↓
services/ (business logic: email, auth, validation)
    ↓
repository/ (database operations)
    ↓
database/ (GORM connection & migrations)
```

**Key Initialization Flow** (from main.go):
1. Load config from environment variables
2. Connect to PostgreSQL database via GORM
3. Run database migrations automatically
4. Initialize services (email, validator, auth with JWT)
5. Initialize repositories (one per model: service, testimonial, gallery, contact, settings, admin)
6. Initialize handlers (public + admin handlers)
7. Setup HTTP routes with middleware (CORS, logging, auth)
8. Start server with graceful shutdown

**Handlers Organization**:
- `health.go` - Health check endpoint
- `contact.go` - Public contact form submission
- `public.go` - Public endpoints for services, testimonials, gallery, settings, content sections
- `upload.go` - File upload handling (auth required)
- `admin_auth.go` - Admin login and authentication
- `admin_services.go` - CRUD for services
- `admin_testimonials.go` - CRUD for testimonials
- `admin_gallery.go` - CRUD for gallery images
- `admin_contacts.go` - View/manage contact form submissions
- `admin_settings.go` - Site settings and content management
- `helpers.go` - Shared JSON response helpers

**Authentication Flow**:
- JWT-based authentication using `services/auth.go`
- `middleware/auth.go` provides `Auth()` middleware and `AuthFunc()` wrapper
- Admin endpoints are protected by auth middleware
- JWT token stored in localStorage on frontend, sent via `Authorization: Bearer <token>` header

**Database Layer**:
- Uses GORM ORM (`gorm.io/gorm`)
- Connection managed in `internal/database/db.go`
- Migrations run via golang-migrate library in `internal/database/migrations.go`
- Repository pattern: each model has a dedicated repository in `internal/repository/`

**Models** (in `internal/models/`):
- `Service` - Dental services with title, description, icon, pricing, display_order, active status
- `Testimonial` - Patient reviews with name, location, content, rating, display_order, active status
- `GalleryImage` - Photos with title, description, image_url, display_order, active status
- `Contact` - Contact form submissions with name, email, phone, message, is_read, timestamps
- `Admin` - Admin users with username, password_hash
- `Settings` - Key-value pairs for site settings (business info, social links, hours, content sections)

### Frontend Architecture (React)

**Two Separate Applications in One Codebase**:

```
App.jsx (root router)
├── /admin/* → AdminApp.jsx (Admin Panel SPA)
│   ├── Uses AdminLayout with Sidebar
│   ├── AuthContext for admin authentication
│   └── Admin pages: Dashboard, Services, Testimonials, Gallery, Contacts, Settings, SiteContent
│
└── /* → PublicSite (Public Website SPA)
    ├── Uses Header/Footer layout
    ├── SiteContext for fetching public data
    └── Section components: Hero, About, Services, Gallery, Testimonials, Contact
```

**Public Site Architecture**:
- **Context**: `SiteContext` (in `context/SiteContext.jsx`) fetches ALL public data on mount:
  - Settings (business info, social links, hours)
  - Content sections (hero, about, contact, footer)
  - Services, testimonials, gallery arrays
- **Data Flow**: SiteProvider wraps the public site → components use `useSite()` hook → render from context
- **Components**:
  - `layout/` - Header (navigation, logo), Footer (contact info, hours, social links)
  - `sections/` - Hero, About, Services, Gallery, Testimonials, Contact
  - `ui/` - Reusable components like Button

**Admin Panel Architecture**:
- **Context**: `AuthContext` (in `admin/context/AuthContext.jsx`) manages:
  - Login/logout
  - JWT token storage in localStorage
  - Axios interceptor for adding auth header to all requests
  - Protected routes redirect to /admin/login if not authenticated
- **Layout**: `AdminLayout` provides sidebar navigation and logout
- **Pages**:
  - `Dashboard.jsx` - Stats overview (contacts, services, testimonials)
  - `Services.jsx` - CRUD for services with drag-to-reorder
  - `Testimonials.jsx` - CRUD for testimonials with drag-to-reorder
  - `Gallery.jsx` - CRUD for gallery images with upload
  - `Contacts.jsx` - View contact submissions, mark as read/unread
  - `Settings.jsx` - Edit business info, social links, hours
  - `SiteContent.jsx` - Edit hero/about/contact/footer text content
- **Shared Components**:
  - `Modal.jsx` - Generic modal for create/edit forms
  - `ConfirmDialog.jsx` - Confirmation dialog for delete actions
  - `Sidebar.jsx` - Admin navigation menu

**API Client** (in `frontend/src/services/api.js`):
- Axios instance with base URL from `VITE_API_URL` environment variable
- Used by both public site (via SiteContext) and admin panel (via AuthContext)

### Database Schema

**Tables**:
- `services` - id, title, description, icon, pricing, display_order, active, created_at, updated_at
- `testimonials` - id, name, location, content, rating, display_order, active, created_at, updated_at
- `gallery_images` - id, title, description, image_url, display_order, active, created_at, updated_at
- `contacts` - id, name, email, phone, message, is_read, created_at, updated_at
- `admins` - id, username, password_hash, created_at, updated_at
- `settings` - id, key (unique), value, created_at, updated_at

**Settings Keys**:
- `business_name`, `business_phone`, `business_email`, `business_address`, `business_city`
- `social_facebook`, `social_twitter`, `social_instagram`
- `hours_weekday`, `hours_saturday`, `hours_sunday`
- Content sections stored as JSON strings: `content_hero`, `content_about`, `content_contact`, `content_footer`

**Migration Files**:
- `000001_init_schema` - Create all tables
- `000002_seed_initial_data` - Seed sample services, testimonials, gallery images, default admin
- `000003_add_site_settings` - Create settings table
- `000004_seed_site_settings` - Seed default settings and content

### Content Management System (CMS)

The admin panel provides **complete content management** without code changes:

1. **Services**: Add/edit/delete dental services with icons, pricing, and ordering
2. **Testimonials**: Add/edit/delete patient reviews with ratings and ordering
3. **Gallery**: Upload and manage photos with descriptions and ordering
4. **Contacts**: View contact form submissions, mark as read/unread, see stats
5. **Settings**: Edit business info (name, phone, email, address), social links, office hours
6. **Site Content**: Edit text content for hero, about, contact, and footer sections (stored as JSON in settings)

**Important**: All content is stored in the database and fetched dynamically. There are no hardcoded content files in the frontend anymore.

## Environment Variables

### Backend (.env in /backend or root for Docker)

**Required**:
- `DATABASE_URL` - PostgreSQL connection string (format: `postgres://user:pass@host:port/db?sslmode=disable`)
- `JWT_SECRET` - Secret key for JWT tokens (min 32 chars, generate with `openssl rand -base64 32`)

**Optional**:
- `PORT` - Server port (default: 8080)
- `FRONTEND_URL` - CORS allowed origin (default: http://localhost:5173)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD` - Email sending via SMTP
- `EMAIL_RECIPIENT` - Where to send contact form submissions
- `UPLOAD_PATH` - Where to store uploaded files (default: ./uploads)
- `UPLOAD_URL_PREFIX` - URL prefix for uploaded files (default: /uploads)
- `JWT_EXPIRATION` - JWT token expiration (default: 24h)

### Frontend (.env in /frontend or root for Docker)

- `VITE_API_URL` - Backend API URL (default: http://localhost:8080/api)

### Docker (.env in root)

**Mode Selection**:
- `BACKEND_DOCKERFILE` - `Dockerfile.dev` (dev) or `Dockerfile` (prod)
- `FRONTEND_DOCKERFILE` - `Dockerfile.dev` (dev) or `Dockerfile` (prod)
- `BACKEND_COMMAND` - `air -c .air.toml` (dev) or `./api` (prod)
- `FRONTEND_COMMAND` - `npm run dev -- --host 0.0.0.0` (dev) or `nginx -g daemon off;` (prod)
- `FRONTEND_INTERNAL_PORT` - `5173` (dev) or `80` (prod)

**Defaults**:
- All environment variables have sensible defaults for development
- See `.env.example` for full list with comments
- Production requires changing: `POSTGRES_PASSWORD`, `JWT_SECRET`, and Dockerfile/command settings

## Common Tasks

### Adding a New Model/Feature

1. **Define Model** in `backend/internal/models/`:
   ```go
   type MyModel struct {
       ID        uint      `gorm:"primaryKey" json:"id"`
       Field     string    `gorm:"not null" json:"field"`
       CreatedAt time.Time `json:"created_at"`
       UpdatedAt time.Time `json:"updated_at"`
   }
   ```

2. **Create Migration** in `backend/migrations/`:
   ```bash
   migrate create -ext sql -dir backend/migrations -seq add_mymodel
   ```
   Write `.up.sql` and `.down.sql`

3. **Create Repository** in `backend/internal/repository/mymodel_repository.go`:
   ```go
   type MyModelRepository struct { db *gorm.DB }
   func NewMyModelRepository(db *gorm.DB) *MyModelRepository
   func (r *MyModelRepository) FindAll() ([]models.MyModel, error)
   // CRUD methods...
   ```

4. **Create Handler** in `backend/internal/handlers/mymodel.go`:
   ```go
   type MyModelHandler struct { repo *repository.MyModelRepository }
   func (h *MyModelHandler) HandleMyModels(w http.ResponseWriter, r *http.Request)
   ```

5. **Wire in main.go**:
   ```go
   myModelRepo := repository.NewMyModelRepository(db)
   myModelHandler := handlers.NewMyModelHandler(myModelRepo)
   mux.HandleFunc("/api/mymodels", myModelHandler.HandleMyModels)
   ```

6. **Add Frontend API Client** in `frontend/src/services/api.js`

7. **Create Admin Page** in `frontend/src/admin/pages/MyModels.jsx`

8. **Update SiteContext** if public data (in `frontend/src/context/SiteContext.jsx`)

### Updating Site Content

**Via Admin Panel** (Recommended):
1. Login at http://localhost:5173/admin/login (default: admin/admin123)
2. Use Settings page for business info, social links, hours
3. Use Site Content page for hero/about/contact/footer text

**Via Database**:
```sql
UPDATE settings SET value = '{"hero_title": "New Title"}' WHERE key = 'content_hero';
```

### Adding API Endpoint

1. Create handler method in appropriate handler file
2. Add route in `main.go`:
   - Public: `mux.HandleFunc("/api/path", handler.Method)`
   - Admin (auth required): `mux.HandleFunc("/api/admin/path", middleware.AuthFunc(authService, handler.Method))`
3. Update frontend API service if needed

### File Upload Flow

1. Upload goes to `/api/admin/upload` (auth required)
2. File stored in `backend/uploads/` (or `UPLOAD_PATH`)
3. Returns URL like `/uploads/filename.jpg`
4. Store URL in database model (e.g., `image_url` field)
5. Frontend serves via backend: `http://localhost:8080/uploads/filename.jpg`

## Important Patterns

### Repository Pattern
All database operations go through repositories. Never use `database.GetDB()` directly in handlers. This allows easy testing and abstracts GORM.

### Handler Pattern
Handlers use helper functions from `handlers/helpers.go`:
- `RespondJSON(w, statusCode, payload)` - Success responses
- `RespondError(w, statusCode, message)` - Error responses
- Extract ID from URL: `strings.TrimPrefix(r.URL.Path, "/api/admin/services/")`

### Middleware Wrapping
- `middleware.Auth(authService)` returns `func(http.Handler) http.Handler` - use with `mux.Handle()`
- `middleware.AuthFunc(authService, handlerFunc)` wraps `http.HandlerFunc` - use with `mux.HandleFunc()`

### Display Order Pattern
Models with `display_order` field (services, testimonials, gallery):
- Repository has `GetMaxOrder()` to determine next order value
- Frontend can drag-to-reorder and call update endpoint
- Always fetch ordered: `ORDER BY display_order ASC`

### Active/Inactive Pattern
Models with `active` boolean (services, testimonials, gallery):
- Public endpoints only return `active = true` via `FindActive()` repository method
- Admin endpoints return all via `FindAll()` and can toggle active status

## Testing

### Backend Tests
```bash
cd backend
go test ./...                    # Run all tests
go test -v ./internal/handlers   # Verbose output for specific package
go test -cover ./...             # With coverage
```

### Manual API Testing
```bash
# Health check
curl http://localhost:8080/api/health

# Get public services
curl http://localhost:8080/api/services

# Login (get JWT token)
curl -X POST http://localhost:8080/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Use token for admin endpoints
curl http://localhost:8080/api/admin/services \
  -H "Authorization: Bearer <token>"
```

## Key Files Reference

### Backend
- `cmd/api/main.go` - Application entry point, routing setup
- `config/config.go` - Environment variable loading
- `internal/database/db.go` - GORM connection setup
- `internal/database/migrations.go` - Migration runner
- `internal/middleware/auth.go` - JWT authentication middleware
- `internal/middleware/cors.go` - CORS middleware
- `internal/services/auth.go` - JWT token generation/validation
- `internal/services/email.go` - SMTP email sending
- `internal/services/validator.go` - Request validation

### Frontend
- `src/App.jsx` - Root component with routing (public vs admin)
- `src/context/SiteContext.jsx` - Global state for public site data
- `src/admin/context/AuthContext.jsx` - Admin authentication state
- `src/admin/AdminApp.jsx` - Admin panel entry point with protected routes
- `src/services/api.js` - Axios API client

### Configuration
- `.env.example` - Environment variable template with documentation
- `docker-compose.yml` - Unified Docker Compose file for dev and prod
- `DOCKER.md` - Comprehensive Docker setup guide
- `Makefile` - **NOTE: Out of date, uses old three-file Docker Compose commands**

## Troubleshooting

### Backend won't start
- Check `DATABASE_URL` is correct and PostgreSQL is running
- Check `JWT_SECRET` is set (min 32 chars)
- Check logs: `docker compose logs -f backend`

### Frontend can't reach API
- Check `VITE_API_URL` matches backend URL
- Check backend CORS allows frontend URL (`FRONTEND_URL` env var)
- Check browser console for CORS errors

### Migrations failing
- Check migration SQL syntax
- Check database connection
- Migrations run automatically on backend startup
- View errors in backend logs

### Admin login not working
- Default credentials: admin/admin123
- Check JWT_SECRET is set on backend
- Check browser localStorage for token after login
- Check network tab for 401 errors

### Docker containers restarting
- Check logs: `docker compose logs -f <service>`
- PostgreSQL: Usually "no space left on device" → run `docker system prune -a --volumes -f`
- Frontend: Check npm install succeeded
- Backend: Check migrations completed

### Hot-reload not working
- Backend: Air should show "watching" message in logs
- Frontend: Vite should show "ready" and file paths
- If broken, rebuild: `docker compose up --build`
