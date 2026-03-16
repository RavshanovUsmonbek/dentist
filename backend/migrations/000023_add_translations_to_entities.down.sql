-- Remove indexes
DROP INDEX IF EXISTS idx_services_translations;
DROP INDEX IF EXISTS idx_testimonials_translations;
DROP INDEX IF EXISTS idx_locations_translations;
DROP INDEX IF EXISTS idx_gallery_images_translations;

-- Remove translations columns
ALTER TABLE services DROP COLUMN IF EXISTS translations;
ALTER TABLE testimonials DROP COLUMN IF EXISTS translations;
ALTER TABLE locations DROP COLUMN IF EXISTS translations;
ALTER TABLE gallery_images DROP COLUMN IF EXISTS translations;
