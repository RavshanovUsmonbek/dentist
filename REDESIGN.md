# Frontend Redesign: Clinical Luxury

## Overview

Complete redesign of the dentist website frontend — both public site and admin panel — focused on eliminating generic AI-generated aesthetics and replacing modal popups with better UX patterns. All backend and data logic is unchanged.

---

## Aesthetic Direction

### Public Site — "Clinical Luxury"

Premium dental clinic feel. Scandinavian-meets-Swiss: refined, trustworthy, timeless.

| Property | Value |
|----------|-------|
| Primary color | Deep slate navy `#1a2744` |
| Background | Warm cream `#faf7f2` |
| Accent | Champagne gold `#c8a96e` |
| Display font | Cormorant Garamond (serif) — headings, large text |
| Body font | DM Sans — body copy, UI labels |

### Admin Panel — Clean Editorial CMS

| Property | Value |
|----------|-------|
| Sidebar | White with subtle right border (not dark gray) |
| Active nav | Gold left-border accent |
| Primary actions | Navy buttons |
| Background | Slate-50 |

---

## Modal Replacement Strategy

The user explicitly requested **no modal popups** anywhere.

### Create/Edit forms → `Drawer.jsx`
A panel that slides in from the right side of the screen. Keeps context visible. Industry standard for CMSes (Contentful, Strapi, Sanity).
- Portal-rendered, backdrop click/Escape closes it
- Sticky footer: Save/Cancel always visible even on tall forms
- Sizes: sm (384px) / md (448px) / lg (512px) / xl (576px)

### Delete confirmations → `InlineConfirm.jsx`
Self-contained stateful wrapper around the delete button.
- Click delete → button morphs to "Delete? [Yes] [No]" inline
- No parent state needed (closure captures item ID)
- Eliminates the `isDeleteOpen` + `selectedItem` + `<ConfirmDialog>` pattern from every page

---

## Implementation Phases

### Phase 1 — Foundation (design tokens, fonts)
- `frontend/tailwind.config.js` — new color scales (`primary`=navy, `gold`, `cream`), font families
- `frontend/src/index.css` — update `@theme {}` CSS variables, add drawer animation utilities
- `frontend/index.html` — Google Fonts (Cormorant Garamond 300/400/600/700 + DM Sans 300/400/500/600)

### Phase 2 — New Admin Components (zero breakage)
- `frontend/src/admin/components/Drawer.jsx` ← NEW
- `frontend/src/admin/components/InlineConfirm.jsx` ← NEW

### Phase 3 — Admin Page Migration
Replace all `<Modal>` with `<Drawer>` and `<ConfirmDialog>` with `<InlineConfirm>` across:
1. `Testimonials.jsx` (1 modal, 1 confirm — simplest)
2. `Services.jsx` (1 modal, 1 confirm)
3. `Contacts.jsx` (view-only drawer, inline delete)
4. `Locations.jsx` (xl drawer for map picker)
5. `Snapshots.jsx` (1 create drawer, 2 inline confirms)
6. `Gallery.jsx` (2 drawers, 2 inline confirms — most complex)

Alongside each migration: update hardcoded `cyan-*` colors → `primary-800` / `gold-500`.

### Phase 4 — Admin Layout Redesign
- `Sidebar.jsx` — White sidebar, gold active accent, display font for logo
- `AdminLayout.jsx` — Slate-50 background
- `Login.jsx` — Navy gradient, gold tooth icon, border-bottom inputs
- `Dashboard.jsx` — Large display-font stat numbers

### Phase 5 — Public Site Redesign

**Complete rewrites** (markup rebuilt, all logic/data bindings identical):
- `Hero.jsx` — Split layout: 55% navy text column / 45% image; Cormorant Garamond H1 ~80px; gold accent line
- `Testimonials.jsx` — Large-quote carousel (auto-advance 5s, dot nav); submission form below with floating labels
- `Services.jsx` — Numbered watermark cards (`01` as background text); gold border on hover; 2-col grid

**Targeted updates** (surgical changes, logic unchanged):
- `Header.jsx` — Transparent on hero → frosted glass on scroll (`bg-cream-50/95 backdrop-blur-md`)
- `About.jsx` — Photo left (gold-framed), text right, vertical gold divider
- `Gallery.jsx` — CSS columns masonry; underline-style category tabs
- `Contact.jsx` — Navy info panel on right; border-bottom-only inputs on left
- `Footer.jsx` — Display font for business name; gold social icons
- `Button.jsx` — Variant colors: primary=navy, accent=gold
- `Card.jsx`, `Input.jsx`, `Textarea.jsx` — Token color updates

---

## Files NOT Modified

| Category | Files |
|----------|-------|
| Contexts | `SiteContext.jsx`, `AuthContext.jsx`, `LanguageContext.jsx` |
| API services | `api.js`, `adminApi.js` |
| Multilingual | `MultiLangInput.jsx`, `MultiLangRichText.jsx`, `MultiLangArrayInput.jsx` |
| Specialized | `RichTextEditor.jsx`, `LocationMapPicker.jsx` |
| Routing | `App.jsx`, `AdminApp.jsx` |
| No-modal pages | `Settings.jsx`, `SiteContent.jsx` (minor color updates only) |
| Backend | Everything in `backend/` |

---

## Verification Checklist

### Admin Panel
- [ ] Login/logout works, JWT stored correctly
- [ ] All CRUD: Drawer opens → form → Save → list updates
- [ ] All CRUD: edit Drawer opens pre-filled
- [ ] All deletes: inline confirm → Yes → deleted
- [ ] File upload inside Gallery Drawer works
- [ ] Map picker inside Locations Drawer (xl) works
- [ ] Snapshot create/restore/export/delete all work
- [ ] Language switcher in sidebar works

### Public Site
- [ ] All sections load CMS data from API
- [ ] Contact form submits successfully
- [ ] Testimonial submission form works
- [ ] Gallery category filter works
- [ ] Language switcher updates all text
- [ ] Header: transparent on hero, frosted on scroll
- [ ] Mobile responsive layout intact
- [ ] Smooth scroll from nav links works
- [ ] Testimonial carousel auto-advances + manual navigation
