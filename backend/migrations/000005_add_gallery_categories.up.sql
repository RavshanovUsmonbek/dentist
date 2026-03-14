-- Add category and tags columns to gallery_images table
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general';
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS tags TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_category ON gallery_images(category);

-- Add comments for documentation
COMMENT ON COLUMN gallery_images.category IS 'Gallery category: general, case_studies, diplomas, conferences';
COMMENT ON COLUMN gallery_images.tags IS 'Comma-separated tags for additional filtering';
