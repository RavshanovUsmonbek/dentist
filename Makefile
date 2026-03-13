.PHONY: help dev prod build-dev build-prod up-dev up-prod down stop clean logs logs-backend logs-frontend logs-db logs-nginx shell-backend shell-frontend shell-db migrate-up migrate-down migrate-create ps

# Default target
help:
	@echo "Dentist Website - Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev           - Start development environment (hot-reload)"
	@echo "  make build-dev     - Build development images"
	@echo "  make logs          - View all logs"
	@echo "  make logs-backend  - View backend logs"
	@echo "  make logs-frontend - View frontend logs"
	@echo "  make logs-db       - View database logs"
	@echo ""
	@echo "Production:"
	@echo "  make prod          - Start production environment"
	@echo "  make build-prod    - Build production images"
	@echo "  make logs-nginx    - View nginx logs"
	@echo ""
	@echo "Database:"
	@echo "  make migrate-up    - Run database migrations"
	@echo "  make migrate-down  - Rollback last migration"
	@echo "  make shell-db      - Access PostgreSQL shell"
	@echo ""
	@echo "General:"
	@echo "  make ps            - List running containers"
	@echo "  make stop          - Stop all containers"
	@echo "  make down          - Stop and remove containers"
	@echo "  make clean         - Stop containers and remove volumes"
	@echo "  make shell-backend - Access backend container shell"
	@echo "  make shell-frontend- Access frontend container shell"

# Development environment
dev: build-dev up-dev

build-dev:
	@echo "Building development images..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml build

up-dev:
	@echo "Starting development environment..."
	@echo "Frontend: http://localhost:5173"
	@echo "Backend API: http://localhost:8080/api"
	@echo "PostgreSQL: localhost:5432"
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
	@echo ""
	@echo "Run 'make logs' to view logs"

# Production environment
prod: build-prod up-prod

build-prod:
	@echo "Building production images..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

up-prod:
	@echo "Starting production environment..."
	@echo "Website: http://localhost"
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo ""
	@echo "Run 'make logs' to view logs"

# Stop containers
stop:
	@echo "Stopping containers..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.prod.yml stop

# Stop and remove containers
down:
	@echo "Stopping and removing containers..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.prod.yml down

# Clean up (removes volumes too)
clean:
	@echo "Cleaning up containers and volumes..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml -f docker-compose.prod.yml down -v
	@echo "Cleaning up build cache..."
	docker system prune -f

# View logs
logs:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

logs-backend:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f backend

logs-frontend:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend

logs-db:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f postgres

logs-nginx:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f nginx

# Shell access
shell-backend:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend sh

shell-frontend:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec frontend sh

shell-db:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec postgres psql -U ${POSTGRES_USER:-dentist_user} -d ${POSTGRES_DB:-dentist_db}

# Database migrations
migrate-up:
	@echo "Running database migrations..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend sh -c "cd /app && migrate -path migrations -database \"${DATABASE_URL}\" up"

migrate-down:
	@echo "Rolling back last migration..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend sh -c "cd /app && migrate -path migrations -database \"${DATABASE_URL}\" down 1"

migrate-create:
	@read -p "Enter migration name: " name; \
	timestamp=$$(date +%Y%m%d%H%M%S); \
	touch backend/migrations/$${timestamp}_$${name}.up.sql; \
	touch backend/migrations/$${timestamp}_$${name}.down.sql; \
	echo "Created migration files: backend/migrations/$${timestamp}_$${name}.{up,down}.sql"

# Container status
ps:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps
