-- Remove gallery category feature
DROP INDEX IF EXISTS idx_gallery_images_category;
ALTER TABLE gallery_images DROP COLUMN IF EXISTS tags;
ALTER TABLE gallery_images DROP COLUMN IF NOT EXISTS category;
