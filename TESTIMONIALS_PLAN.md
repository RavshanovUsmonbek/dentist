# Testimonial Public Submission with Admin Moderation

## Overview
Clients can submit reviews via a public form on the website. Submissions go into a **pending** queue. Admins approve or reject them before they appear publicly. The existing admin-create flow stays intact.

---

## Database — Migration `000026`

Add `status VARCHAR(20) DEFAULT 'approved'` to `testimonials` table.

| Value | Meaning |
|-------|---------|
| `approved` | Visible on public site (default for admin-created) |
| `pending` | Awaiting admin review (default for public submissions) |
| `rejected` | Declined, never shown |

---

## Backend Changes

### Model (`backend/internal/models/testimonial.go`)
- Add `Status string` field (`gorm:"type:varchar(20);default:'approved'"`)
- Add `PublicTestimonialRequest` struct (Name, Rating, Text — no auth fields)

### Repository (`backend/internal/repository/testimonial_repository.go`)
- Update `FindActive()` — add `AND status = 'approved'` filter
- Add `FindPending()` — returns all `status = 'pending'`
- Add `UpdateStatus(id, status, active)` — used by approve/reject

### Handlers
**Public** (`backend/internal/handlers/public.go`):
- `POST /api/testimonials` — `HandleTestimonialSubmit`: creates with `status=pending, active=false`, auto-generates initials

**Admin** (`backend/internal/handlers/admin_testimonials.go`):
- `GET  /api/admin/testimonials/pending` — `HandlePending`: list pending
- `PATCH /api/admin/testimonials/:id/approve` — sets `status=approved, active=true`
- `PATCH /api/admin/testimonials/:id/reject` — sets `status=rejected, active=false`

### Routes (`backend/cmd/api/main.go`)
- `/api/testimonials` — GET (existing public list) + POST (new public submit)
- `/api/admin/testimonials/pending` — new admin route
- `/api/admin/testimonials/:id/approve` and `/reject` — new admin routes

---

## Frontend Changes

### Admin API (`frontend/src/admin/services/adminApi.js`)
Add: `getPendingTestimonials`, `approveTestimonial(id)`, `rejectTestimonial(id)`

### Admin Testimonials Page (`frontend/src/admin/pages/Testimonials.jsx`)
Add **"Pending Reviews"** section above the existing list:
- Shows count badge
- Each pending item has **Approve** (green) and **Reject** (red) buttons
- Refreshes both lists after action

### Public Testimonials Section (`frontend/src/components/sections/Testimonials.jsx`)
Add **"Leave a Review"** form below the testimonials grid:
- Fields: Name, Star rating (1–5), Review text
- On success: "Thank you! Your review is pending approval."
- Supports all 3 languages (uz/ru/en)

### i18n Keys (`frontend/src/i18n/locales/*.json`)
Under `testimonials`: `leaveReview`, `yourName`, `yourRating`, `yourReview`, `submitReview`, `submitSuccess`, `submitError`
Under `admin.testimonials`: `pendingReviews`, `noPendingReviews`, `approve`, `reject`

---

## Files to Modify
- `backend/migrations/000026_add_testimonial_status.up.sql` + `.down.sql` (new)
- `backend/internal/models/testimonial.go`
- `backend/internal/repository/testimonial_repository.go`
- `backend/internal/handlers/admin_testimonials.go`
- `backend/internal/handlers/public.go`
- `backend/cmd/api/main.go`
- `frontend/src/admin/services/adminApi.js`
- `frontend/src/admin/pages/Testimonials.jsx`
- `frontend/src/components/sections/Testimonials.jsx`
- `frontend/src/i18n/locales/en.json` + `ru.json` + `uz.json`
