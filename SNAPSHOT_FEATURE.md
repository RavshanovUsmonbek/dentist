# Snapshot Feature

## Overview

The Snapshot feature allows admins to save complete point-in-time copies of the website's CMS content, restore from any saved snapshot, export snapshots as JSON files, and import snapshots from JSON files. This enables safe experimentation, version management, and easy environment migration.

---

## What Gets Snapshotted

All 7 CMS entity types are captured — each with their full multi-language `translations` JSONB data:

| Entity | Table |
|--------|-------|
| Services | `services` |
| Testimonials | `testimonials` |
| Gallery Images | `gallery_images` |
| Gallery Categories | `gallery_categories` |
| Locations | `locations` |
| Site Settings | `site_settings` |
| Site Content | `site_content` |

**Not included:** `contact_submissions`, `admin_users`, or actual uploaded image files (only image URL metadata is saved).

---

## Snapshot JSON Format

```json
{
  "version": "1",
  "snapshotted_at": "2026-03-21T10:00:00Z",
  "services": [...],
  "testimonials": [...],
  "gallery_categories": [...],
  "gallery_images": [...],
  "locations": [...],
  "site_settings": [...],
  "site_content": [...]
}
```

Validation rules:
- `version` must be `"1"`
- All 7 array keys must be present (can be empty `[]`)

---

## Admin UI Features

Navigate to **Admin → Snapshots** (`/admin/snapshots`):

| Feature | Description |
|---------|-------------|
| **Create Snapshot** | Save current DB state with a name + optional description |
| **List Snapshots** | View all saved snapshots with name, description, and creation date |
| **Restore** | Replace all current CMS content with the snapshot data (with confirmation) |
| **Export** | Download the snapshot as a `.json` file |
| **Import** | Upload a `.json` file → preview entity counts → save and/or restore |
| **Delete** | Remove a saved snapshot |

---

## Backend Architecture

### Database Table: `snapshots`

```sql
id          SERIAL PRIMARY KEY
name        VARCHAR(200) NOT NULL
description TEXT
data        JSONB NOT NULL DEFAULT '{}'
created_at  TIMESTAMP WITH TIME ZONE
updated_at  TIMESTAMP WITH TIME ZONE
```

### API Endpoints (all require JWT auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/snapshots` | List all snapshots (without data blob) |
| `POST` | `/api/admin/snapshots` | Create snapshot from current DB state |
| `GET` | `/api/admin/snapshots/:id` | Get single snapshot (includes data) |
| `DELETE` | `/api/admin/snapshots/:id` | Delete a snapshot |
| `POST` | `/api/admin/snapshots/:id/restore` | Restore content from snapshot |
| `GET` | `/api/admin/snapshots/:id/export` | Download snapshot as JSON file |
| `POST` | `/api/admin/snapshots/import` | Import snapshot from JSON body |
| `POST` | `/api/admin/snapshots/import?restore=true` | Import and immediately restore |

### Restore Behavior

Restore runs in a **single database transaction**:
1. DELETE all rows from the 7 entity tables
2. Re-insert all rows from the snapshot blob using `CreateInBatches`
3. Reset PostgreSQL SERIAL sequences (`setval`) so future inserts get correct IDs
4. If any step fails, the entire transaction rolls back — old data is preserved

---

## File Structure

```
backend/
  migrations/
    000027_add_snapshots.up.sql
    000027_add_snapshots.down.sql
  internal/
    models/snapshot.go
    repository/snapshot_repository.go
    handlers/admin_snapshots.go
  cmd/api/main.go                      (modified — wiring)

frontend/src/
  admin/
    pages/Snapshots.jsx                (new)
    services/adminApi.js               (modified — 7 new methods)
    components/Sidebar.jsx             (modified — nav item)
    AdminApp.jsx                       (modified — route)
  i18n/locales/
    en.json, uz.json, ru.json          (modified — snapshot keys)
```

---

## Import File Validation

Both client-side (React) and server-side (Go) validate the uploaded JSON:
- `version` field must equal `"1"`
- Keys `services`, `testimonials`, `gallery_categories`, `gallery_images`, `locations`, `site_settings`, `site_content` must all be present as arrays

---

## Testing

```bash
# Login and get token
TOKEN=$(curl -s -X POST http://localhost:8080/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.data.token')

# Create a snapshot
curl -X POST http://localhost:8080/api/admin/snapshots \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Before experiment","description":"Baseline state"}'

# List snapshots
curl http://localhost:8080/api/admin/snapshots -H "Authorization: Bearer $TOKEN"

# Export snapshot (downloads JSON)
curl http://localhost:8080/api/admin/snapshots/1/export \
  -H "Authorization: Bearer $TOKEN" -o snapshot.json

# Restore a snapshot
curl -X POST http://localhost:8080/api/admin/snapshots/1/restore \
  -H "Authorization: Bearer $TOKEN"

# Import from file
curl -X POST http://localhost:8080/api/admin/snapshots/import \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @snapshot.json

# Delete a snapshot
curl -X DELETE http://localhost:8080/api/admin/snapshots/1 \
  -H "Authorization: Bearer $TOKEN"
```
