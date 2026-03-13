# Multi-stage build for production

# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /build

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci && \
    npm cache clean --force

# Copy source code
COPY . .

# Build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build the application
RUN npm run build

# Stage 2: Runtime with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /build/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx (runs as root by default in containers)
CMD ["nginx", "-g", "daemon off;"]
