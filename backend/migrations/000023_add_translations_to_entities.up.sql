-- Add translations to services
ALTER TABLE services ADD COLUMN translations JSONB DEFAULT '{}'::jsonb;
UPDATE services SET translations = jsonb_build_object(
  'title', jsonb_build_object('uz', title),
  'description', jsonb_build_object('uz', description)
);
CREATE INDEX idx_services_translations ON services USING gin(translations);

-- Add translations to testimonials
ALTER TABLE testimonials ADD COLUMN translations JSONB DEFAULT '{}'::jsonb;
UPDATE testimonials SET translations = jsonb_build_object(
  'name', jsonb_build_object('uz', name),
  'text', jsonb_build_object('uz', text)
);
CREATE INDEX idx_testimonials_translations ON testimonials USING gin(translations);

-- Add translations to locations
ALTER TABLE locations ADD COLUMN translations JSONB DEFAULT '{}'::jsonb;
UPDATE locations SET translations = jsonb_build_object(
  'name', jsonb_build_object('uz', name),
  'address', jsonb_build_object('uz', address)
);
CREATE INDEX idx_locations_translations ON locations USING gin(translations);

-- Add translations to gallery_images (for alt_text)
ALTER TABLE gallery_images ADD COLUMN translations JSONB DEFAULT '{}'::jsonb;
UPDATE gallery_images SET translations = jsonb_build_object(
  'alt_text', jsonb_build_object('uz', COALESCE(alt_text, ''))
);
CREATE INDEX idx_gallery_images_translations ON gallery_images USING gin(translations);
