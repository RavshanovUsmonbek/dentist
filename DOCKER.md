# Docker Setup Guide - Simplified

## Overview

This project uses a **single docker-compose.yml** that works for both development and production. No more juggling multiple files!

- **Development (default)**: Hot-reload, exposed ports, easy debugging
- **Production**: Optimized builds, Nginx reverse proxy, minimal ports

## Prerequisites

1. **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
   - Make sure Docker Desktop is running

2. **Docker Compose** - Included with Docker Desktop

3. **Free Ports** (development):
   - Port **5173** - Frontend (Vite dev server)
   - Port **8080** - Backend API
   - Port **5433** - PostgreSQL

## Quick Start (Development)

### Step 1: Navigate to Project Directory

```bash
cd /Users/usmonbek/WORK/dentist
```

### Step 2: Create Environment File (if needed)

```bash
# Copy example if .env doesn't exist
cp .env.example .env
```

### Step 3: Start Development Mode

```bash
# Single command - that's it!
docker compose up --build
```

This will:
- ✅ Build all services with hot-reload
- ✅ Start PostgreSQL on port 5433
- ✅ Start backend API on port 8080 (with Air hot-reload)
- ✅ Start frontend on port 5173 (with Vite HMR)
- ✅ Run database migrations automatically
- ✅ Create persistent volumes for database and uploads

### Step 4: Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | React website |
| **Admin Panel** | http://localhost:5173/admin/login | Admin dashboard |
| **Backend API** | http://localhost:8080/api/health | Health check |
| **Database** | localhost:5433 | PostgreSQL |

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

## Production Mode

### Create Production Environment File

Create `.env.production`:

```env
# Production Configuration
BACKEND_DOCKERFILE=Dockerfile
FRONTEND_DOCKERFILE=Dockerfile
BACKEND_COMMAND=./api
FRONTEND_COMMAND=nginx -g daemon off;
FRONTEND_INTERNAL_PORT=80

# Security - CHANGE THESE!
POSTGRES_PASSWORD=your_secure_password_here
JWT_SECRET=your_secure_jwt_secret_min_32_chars_here

# Production URLs
POSTGRES_PORT=5432
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
```

### Start Production Mode

```bash
docker compose --env-file .env.production --profile production up --build -d
```

This will:
- Build optimized production images
- Start Nginx on port 80 (and 443 for HTTPS)
- Hide backend/frontend ports (access via Nginx only)
- Use production environment variables

**Access**: http://localhost (or your domain)

## Common Commands

### Development

```bash
# Start services (foreground)
docker compose up --build

# Start services (background)
docker compose up --build -d

# Stop services (keep data)
docker compose down

# Stop and remove all data
docker compose down -v

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Restart a service
docker compose restart backend

# Rebuild after dependency changes
docker compose up --build
```

### Production

```bash
# Start production
docker compose --env-file .env.production --profile production up -d

# View logs
docker compose --env-file .env.production logs -f

# Stop production
docker compose --env-file .env.production --profile production down
```

### Shell Access

```bash
# Backend container
docker exec -it dentist_backend sh

# Frontend container
docker exec -it dentist_frontend sh

# PostgreSQL command line
docker exec -it dentist_postgres psql -U dentist_user -d dentist_db
```

### Database Operations

```bash
# Connect to PostgreSQL
docker exec -it dentist_postgres psql -U dentist_user -d dentist_db

# View tables
docker exec -it dentist_postgres psql -U dentist_user -d dentist_db -c "\dt"

# Backup database
docker exec dentist_postgres pg_dump -U dentist_user dentist_db > backup.sql

# Restore database
cat backup.sql | docker exec -i dentist_postgres psql -U dentist_user -d dentist_db
```

### Cleanup

```bash
# Clean up unused images/containers
docker system prune -a

# Remove volumes (CAUTION: deletes data)
docker volume prune

# Complete reset
docker compose down -v
docker system prune -a --volumes
```

## Environment Variables

All variables have **sensible defaults** for development. Only change what you need!

### Development Mode (defaults in .env)

```env
# Docker Configuration (leave as-is for development)
BACKEND_DOCKERFILE=Dockerfile.dev
FRONTEND_DOCKERFILE=Dockerfile.dev
BACKEND_COMMAND=air -c .air.toml
FRONTEND_COMMAND=npm run dev -- --host 0.0.0.0
FRONTEND_INTERNAL_PORT=5173

# Database (defaults work fine)
POSTGRES_DB=dentist_db
POSTGRES_USER=dentist_user
POSTGRES_PASSWORD=dentist_dev_pass
POSTGRES_PORT=5433
DATABASE_URL=postgres://dentist_user:dentist_dev_pass@postgres:5432/dentist_db?sslmode=disable

# Backend
BACKEND_PORT=8080
FRONTEND_URL=http://localhost:5173

# JWT (insecure default for dev)
JWT_SECRET=insecure_dev_secret_min_32_chars
JWT_EXPIRATION=24h

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
EMAIL_RECIPIENT=

# Frontend
VITE_API_URL=http://localhost:8080/api
```

### What to Change for Production

**Required Changes:**
- `POSTGRES_PASSWORD` - Use strong password
- `JWT_SECRET` - Generate with `openssl rand -base64 32`
- `BACKEND_DOCKERFILE` - Set to `Dockerfile`
- `FRONTEND_DOCKERFILE` - Set to `Dockerfile`

**Recommended Changes:**
- `FRONTEND_URL` - Your domain
- `VITE_API_URL` - Your API endpoint
- SMTP credentials (for email)

## Troubleshooting

### Port Already in Use

**Error:** `bind: address already in use`

**Solution:**
```bash
# Find what's using the port
lsof -i :5433    # or :8080, :5173

# Change port in .env
POSTGRES_PORT=5434  # Use different port
```

### Containers Won't Start

**Solution:**
```bash
# Complete reset
docker compose down -v
docker compose up --build
```

### Frontend Container Restarting

**Possible causes:**
- npm dependencies not installed
- Port conflict
- Build errors

**Check logs:**
```bash
docker compose logs -f frontend
```

### Backend Can't Connect to Database

**Check:**
1. PostgreSQL is healthy: `docker compose ps`
2. DATABASE_URL uses `postgres` as hostname (not `localhost`)
3. Password matches in .env

```bash
# Test database connection
docker exec -it dentist_postgres psql -U dentist_user -d dentist_db -c "SELECT 1"
```

### Hot-Reload Not Working

**Backend (Go with Air):**
```bash
# Check Air is running
docker compose logs -f backend | grep "watching"

# If not working, rebuild
docker compose up --build backend
```

**Frontend (React with Vite):**
```bash
# Check Vite is running
docker compose logs -f frontend | grep "ready"

# Clear node_modules volume
docker compose down
docker volume rm dentist_frontend_node_modules
docker compose up --build
```

### Database Migrations Failed

```bash
# View backend logs for migration errors
docker compose logs backend | grep migration

# Manually run migrations
docker exec -it dentist_backend sh
# Inside container:
migrate -path ./migrations -database "$DATABASE_URL" up
```

## Architecture

### Development Mode (default)

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Frontend   │  │   Backend    │  │  PostgreSQL  │   │
│  │  (Vite HMR)  │  │ (Air reload) │  │              │   │
│  │              │  │              │  │              │   │
│  │  Port 5173   │  │  Port 8080   │  │  Port 5432   │   │
│  │  (external)  │  │  (external)  │  │  → 5433 ext  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘

External Access:
- http://localhost:5173  → Frontend (direct)
- http://localhost:8080  → Backend API (direct)
- localhost:5433         → PostgreSQL (direct)
```

### Production Mode (--profile production)

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                      Nginx                         │  │
│  │               (Reverse Proxy)                      │  │
│  │                  Port 80/443                       │  │
│  │                   (external)                       │  │
│  └───────┬────────────────────────────────┬──────────┘  │
│          │                                │             │
│  ┌───────▼────────┐              ┌────────▼─────────┐   │
│  │   Frontend     │              │    Backend       │   │
│  │ (Static build) │              │ (Optimized bin)  │   │
│  │   Port 80      │              │   Port 8080      │   │
│  │  (internal)    │              │   (internal)     │   │
│  └────────────────┘              └────────┬─────────┘   │
│                                           │             │
│                                   ┌───────▼─────────┐   │
│                                   │   PostgreSQL    │   │
│                                   │                 │   │
│                                   │   Port 5432     │   │
│                                   │   (internal)    │   │
│                                   └─────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘

External Access:
- http://localhost  → Nginx (serves frontend + proxies API)
```

## Development Workflow

1. **Make code changes** - Files are mounted as volumes
2. **Backend auto-reloads** - Air watches `.go` files
3. **Frontend auto-reloads** - Vite HMR updates browser
4. **Database persists** - Data in Docker volume survives restarts

No need to rebuild after code changes! Just save and watch it reload.

## Migrating from Old Setup

If you have the old three-file setup:

```bash
# Backup old files
mv docker-compose.dev.yml docker-compose.dev.yml.backup
mv docker-compose.prod.yml docker-compose.prod.yml.backup

# Stop old containers
docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# Start with new single file
docker compose up --build
```

## Summary

**Before (complicated):**
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

**After (simple):**
```bash
docker compose up --build
```

**Production:**
```bash
docker compose --env-file .env.production --profile production up -d
```

That's it! One file, simple commands, works reliably.
