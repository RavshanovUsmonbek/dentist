-- Create gallery_categories table for dynamic category management
CREATE TABLE IF NOT EXISTS gallery_categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    label VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gallery_categories_slug ON gallery_categories(slug);
CREATE INDEX IF NOT EXISTS idx_gallery_categories_enabled ON gallery_categories(enabled);
CREATE INDEX IF NOT EXISTS idx_gallery_categories_display_order ON gallery_categories(display_order);

-- Add foreign key constraint to gallery_images (optional - allows orphaned images to exist)
-- We'll keep it flexible for now - if a category is deleted, images can default to 'general'
