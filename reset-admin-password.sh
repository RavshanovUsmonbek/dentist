#!/bin/bash

# Script to reset admin password in Docker environment

set -e

USERNAME="${1:-admin}"
PASSWORD="${2:-admin123}"

echo "================================"
echo "Admin Password Reset Tool"
echo "================================"
echo ""
echo "Username: $USERNAME"
echo "Password: $PASSWORD"
echo ""

# Check if backend container is running
if ! docker ps | grep -q dentist_backend; then
    echo "Error: Backend container is not running"
    echo "Please start the application first: docker compose up -d"
    exit 1
fi

# Run the password reset tool inside the backend container
echo "Running password reset..."
docker exec dentist_backend sh -c "cd /app && ./reset-password '$USERNAME' '$PASSWORD'"

echo ""
echo "================================"
echo "You can now login with:"
echo "  Username: $USERNAME"
echo "  Password: $PASSWORD"
echo "================================"