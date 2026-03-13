# Routes Documentation

This document provides a comprehensive overview of all routes in the Dentist Website application.

## Table of Contents
- [Frontend Routes](#frontend-routes)
  - [Public Routes](#public-routes)
  - [Admin Panel Routes](#admin-panel-routes)
- [Backend API Routes](#backend-api-routes)
  - [Public API Endpoints](#public-api-endpoints)
  - [Admin API Endpoints](#admin-api-endpoints)

---

## Frontend Routes

Base URL (Development): `http://localhost:5173`

### Public Routes

The public website is a single-page application (SPA) that displays all sections on the home page.

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `PublicSite` | Main public website with all sections (Hero, About, Services, Gallery, Testimonials, Contact) |

**Sections on Public Site:**
- Hero section with call-to-action
- About section with dentist profile
- Services section with all active services
- Gallery section with active images
- Testimonials section with active reviews
- Contact form section

### Admin Panel Routes

Base URL: `http://localhost:5173/admin`

**Authentication Required**: All admin routes except `/admin/login` require JWT authentication. Unauthenticated users are redirected to `/admin/login`.

| Route | Component | Description | Auth Required |
|-------|-----------|-------------|---------------|
| `/admin/login` | `Login` | Admin login page | No |
| `/admin/dashboard` | `Dashboard` | Admin dashboard with statistics overview | Yes |
| `/admin/services` | `Services` | Manage dental services (CRUD operations) | Yes |
| `/admin/testimonials` | `Testimonials` | Manage patient testimonials (CRUD operations) | Yes |
| `/admin/gallery` | `Gallery` | Manage gallery images (CRUD, upload) | Yes |
| `/admin/contacts` | `Contacts` | View and manage contact form submissions | Yes |
| `/admin/settings` | `Settings` | Edit business info, social links, office hours | Yes |
| `/admin/content` | `SiteContent` | Edit hero, about, contact, footer text content | Yes |

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

**Admin Features:**
- Drag-and-drop reordering for services, testimonials, and gallery
- Toggle active/inactive status for content visibility
- Upload images for gallery
- Mark contact submissions as read/unread
- Edit all text content without code changes

---

## Backend API Routes

Base URL (Development): `http://localhost:8080/api`

### Public API Endpoints

These endpoints are accessible without authentication.

#### Health Check

```
GET /api/health
```

**Description**: Check API server health status

**Response**: `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2024-03-14T12:34:56Z"
}
```

#### Contact Form

```
POST /api/contact
```

**Description**: Submit contact form (sends email to configured recipient)

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "message": "I would like to schedule an appointment."
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Thank you for contacting us! We'll get back to you soon."
}
```

**Error Response**: `400 Bad Request` or `500 Internal Server Error`
```json
{
  "success": false,
  "error": "Error message here"
}
```

#### Get Services

```
GET /api/services
```

**Description**: Get all active services ordered by display_order

**Response**: `200 OK`
```json
{
  "success": true,
  "services": [
    {
      "id": 1,
      "title": "General Dentistry",
      "description": "Comprehensive dental care for the whole family",
      "icon": "FaTooth",
      "pricing": "$100 - $300",
      "display_order": 1,
      "active": true,
      "created_at": "2024-03-14T12:34:56Z",
      "updated_at": "2024-03-14T12:34:56Z"
    }
  ]
}
```

#### Get Testimonials

```
GET /api/testimonials
```

**Description**: Get all active testimonials ordered by display_order

**Response**: `200 OK`
```json
{
  "success": true,
  "testimonials": [
    {
      "id": 1,
      "name": "Sarah Johnson",
      "location": "New York, NY",
      "content": "Excellent service! Dr. Smith and the staff were professional...",
      "rating": 5,
      "display_order": 1,
      "active": true,
      "created_at": "2024-03-14T12:34:56Z",
      "updated_at": "2024-03-14T12:34:56Z"
    }
  ]
}
```

#### Get Gallery

```
GET /api/gallery
```

**Description**: Get all active gallery images ordered by display_order

**Response**: `200 OK`
```json
{
  "success": true,
  "gallery": [
    {
      "id": 1,
      "title": "Modern Dental Office",
      "description": "Our state-of-the-art facility",
      "image_url": "/uploads/office.jpg",
      "display_order": 1,
      "active": true,
      "created_at": "2024-03-14T12:34:56Z",
      "updated_at": "2024-03-14T12:34:56Z"
    }
  ]
}
```

#### Get Settings

```
GET /api/settings
```

**Description**: Get all site settings (business info, social links, hours)

**Response**: `200 OK`
```json
{
  "success": true,
  "settings": {
    "business_name": "Smile Dental Care",
    "business_phone": "(555) 123-4567",
    "business_email": "info@smiledentalcare.com",
    "business_address": "123 Dental Street, Suite 100",
    "business_city": "Your City, ST 12345",
    "social_facebook": "https://facebook.com/...",
    "social_twitter": "https://twitter.com/...",
    "social_instagram": "https://instagram.com/...",
    "hours_weekday": "Monday - Friday: 8:00 AM - 6:00 PM",
    "hours_saturday": "Saturday: 9:00 AM - 3:00 PM",
    "hours_sunday": "Sunday: Closed"
  }
}
```

#### Get Content Section

```
GET /api/content/:section
```

**Description**: Get content for a specific section (hero, about, contact, footer)

**Parameters**:
- `section` - Section name (hero, about, contact, footer)

**Example**: `GET /api/content/hero`

**Response**: `200 OK`
```json
{
  "success": true,
  "content": {
    "hero_title": "Welcome to Smile Dental Care",
    "hero_subtitle": "Your Trusted Partner for a Healthy Smile",
    "hero_cta_text": "Book Appointment",
    "hero_cta_link": "#contact"
  }
}
```

---

### Admin API Endpoints

**Authentication Required**: All admin endpoints require a valid JWT token in the `Authorization` header.

**Header Format**:
```
Authorization: Bearer <jwt_token>
```

**Authentication Error Response**: `401 Unauthorized`
```json
{
  "error": "Unauthorized"
}
```

#### Admin Login

```
POST /api/admin/login
```

**Description**: Login to admin panel (No auth required)

**Request Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "username": "admin"
  }
}
```

**Error Response**: `401 Unauthorized`
```json
{
  "error": "Invalid username or password"
}
```

#### Get Admin Info

```
GET /api/admin/me
```

**Description**: Get current admin user information

**Response**: `200 OK`
```json
{
  "success": true,
  "admin": {
    "id": 1,
    "username": "admin",
    "created_at": "2024-03-14T12:34:56Z"
  }
}
```

---

#### Admin Services

##### List All Services

```
GET /api/admin/services
```

**Description**: Get all services (including inactive)

**Response**: `200 OK`
```json
{
  "success": true,
  "services": [...]
}
```

##### Create Service

```
POST /api/admin/services
```

**Request Body**:
```json
{
  "title": "Teeth Whitening",
  "description": "Professional teeth whitening services",
  "icon": "FaStar",
  "pricing": "$200 - $500",
  "active": true
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "service": {
    "id": 5,
    "title": "Teeth Whitening",
    "description": "Professional teeth whitening services",
    "icon": "FaStar",
    "pricing": "$200 - $500",
    "display_order": 5,
    "active": true,
    "created_at": "2024-03-14T12:34:56Z",
    "updated_at": "2024-03-14T12:34:56Z"
  }
}
```

##### Update Service

```
PUT /api/admin/services/:id
```

**Parameters**:
- `id` - Service ID

**Request Body**:
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "icon": "FaTooth",
  "pricing": "$150 - $400",
  "display_order": 2,
  "active": false
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "service": {...}
}
```

##### Delete Service

```
DELETE /api/admin/services/:id
```

**Parameters**:
- `id` - Service ID

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

---

#### Admin Testimonials

##### List All Testimonials

```
GET /api/admin/testimonials
```

**Description**: Get all testimonials (including inactive)

**Response**: `200 OK`
```json
{
  "success": true,
  "testimonials": [...]
}
```

##### Create Testimonial

```
POST /api/admin/testimonials
```

**Request Body**:
```json
{
  "name": "John Smith",
  "location": "Boston, MA",
  "content": "Amazing experience! Highly recommend...",
  "rating": 5,
  "active": true
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "testimonial": {...}
}
```

##### Update Testimonial

```
PUT /api/admin/testimonials/:id
```

**Parameters**:
- `id` - Testimonial ID

**Request Body**:
```json
{
  "name": "John Smith",
  "location": "Boston, MA",
  "content": "Updated content...",
  "rating": 4,
  "display_order": 3,
  "active": true
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "testimonial": {...}
}
```

##### Delete Testimonial

```
DELETE /api/admin/testimonials/:id
```

**Parameters**:
- `id` - Testimonial ID

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Testimonial deleted successfully"
}
```

---

#### Admin Gallery

##### List All Gallery Images

```
GET /api/admin/gallery
```

**Description**: Get all gallery images (including inactive)

**Response**: `200 OK`
```json
{
  "success": true,
  "gallery": [...]
}
```

##### Create Gallery Image

```
POST /api/admin/gallery
```

**Request Body**:
```json
{
  "title": "Reception Area",
  "description": "Our welcoming reception area",
  "image_url": "/uploads/reception.jpg",
  "active": true
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "image": {...}
}
```

##### Update Gallery Image

```
PUT /api/admin/gallery/:id
```

**Parameters**:
- `id` - Gallery image ID

**Request Body**:
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "image_url": "/uploads/new-image.jpg",
  "display_order": 2,
  "active": true
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "image": {...}
}
```

##### Delete Gallery Image

```
DELETE /api/admin/gallery/:id
```

**Parameters**:
- `id` - Gallery image ID

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Gallery image deleted successfully"
}
```

---

#### Admin Contacts

##### List All Contacts

```
GET /api/admin/contacts
```

**Description**: Get all contact form submissions

**Response**: `200 OK`
```json
{
  "success": true,
  "contacts": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "123-456-7890",
      "message": "I would like to schedule an appointment.",
      "is_read": false,
      "created_at": "2024-03-14T12:34:56Z",
      "updated_at": "2024-03-14T12:34:56Z"
    }
  ]
}
```

##### Get Contact Stats

```
GET /api/admin/contacts/stats
```

**Description**: Get contact statistics (total, unread count)

**Response**: `200 OK`
```json
{
  "success": true,
  "stats": {
    "total": 25,
    "unread": 5
  }
}
```

##### Update Contact (Mark as Read/Unread)

```
PUT /api/admin/contacts/:id
```

**Parameters**:
- `id` - Contact ID

**Request Body**:
```json
{
  "is_read": true
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "contact": {...}
}
```

##### Delete Contact

```
DELETE /api/admin/contacts/:id
```

**Parameters**:
- `id` - Contact ID

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

---

#### Admin Settings

##### Get All Settings

```
GET /api/admin/settings
```

**Description**: Get all site settings

**Response**: `200 OK`
```json
{
  "success": true,
  "settings": {
    "business_name": "Smile Dental Care",
    "business_phone": "(555) 123-4567",
    ...
  }
}
```

##### Update Settings

```
PUT /api/admin/settings
```

**Request Body**:
```json
{
  "business_name": "New Dental Practice",
  "business_phone": "(555) 999-8888",
  "business_email": "contact@newdental.com",
  "business_address": "456 Main Street",
  "business_city": "New City, CA 90210",
  "social_facebook": "https://facebook.com/newdental",
  "social_twitter": "https://twitter.com/newdental",
  "social_instagram": "https://instagram.com/newdental",
  "hours_weekday": "Monday - Friday: 9:00 AM - 5:00 PM",
  "hours_saturday": "Saturday: 10:00 AM - 2:00 PM",
  "hours_sunday": "Sunday: Closed"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "settings": {...}
}
```

---

#### Admin Content

##### Get All Content Sections

```
GET /api/admin/content
```

**Description**: Get all content sections (hero, about, contact, footer)

**Response**: `200 OK`
```json
{
  "success": true,
  "content": {
    "hero": {...},
    "about": {...},
    "contact": {...},
    "footer": {...}
  }
}
```

##### Update Content Section

```
PUT /api/admin/content/:section
```

**Parameters**:
- `section` - Section name (hero, about, contact, footer)

**Example**: `PUT /api/admin/content/hero`

**Request Body** (Hero):
```json
{
  "hero_title": "Welcome to Our Practice",
  "hero_subtitle": "Quality Dental Care",
  "hero_cta_text": "Schedule Today",
  "hero_cta_link": "#contact"
}
```

**Request Body** (About):
```json
{
  "about_title": "About Dr. Smith",
  "about_subtitle": "Your Dental Health Partner",
  "about_content": "Dr. Smith has over 20 years of experience..."
}
```

**Request Body** (Contact):
```json
{
  "contact_title": "Get in Touch",
  "contact_subtitle": "We're here to help",
  "contact_description": "Contact us for appointments or questions"
}
```

**Request Body** (Footer):
```json
{
  "footer_description": "Providing exceptional dental care..."
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "content": {...}
}
```

---

#### File Upload

```
POST /api/admin/upload
```

**Description**: Upload a file (image) to the server

**Request**: `multipart/form-data`
- Form field name: `file`

**Response**: `200 OK`
```json
{
  "success": true,
  "url": "/uploads/filename_20240314123456.jpg"
}
```

**Error Response**: `400 Bad Request`
```json
{
  "error": "File size exceeds maximum limit (10MB)"
}
```

**Notes**:
- Maximum file size: 10MB
- Uploaded files are stored in `backend/uploads/` directory
- Files are accessible via: `http://localhost:8080/uploads/filename.jpg`

---

#### Serve Uploaded Files

```
GET /uploads/:filename
```

**Description**: Serve uploaded files (publicly accessible)

**Parameters**:
- `filename` - Name of the uploaded file

**Example**: `GET /uploads/office_20240314123456.jpg`

**Response**: Image file content

---

## CORS Configuration

The backend API is configured to accept requests from the frontend URL specified in the `FRONTEND_URL` environment variable.

**Development**: `http://localhost:5173`
**Production**: Set to your production domain

## Authentication Flow

1. Admin logs in via `POST /api/admin/login`
2. Server returns JWT token
3. Frontend stores token in `localStorage`
4. All subsequent admin API requests include token in `Authorization` header: `Bearer <token>`
5. Backend middleware validates token for protected routes
6. Token expires after configured time (default: 24 hours)
7. On token expiration, user is redirected to login page

## Error Handling

All API endpoints follow consistent error response format:

```json
{
  "error": "Error message describing what went wrong",
  "success": false
}
```

Common HTTP status codes:
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid credentials
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error