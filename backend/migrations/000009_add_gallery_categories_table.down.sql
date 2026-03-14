-- Drop indexes
DROP INDEX IF EXISTS idx_gallery_categories_display_order;
DROP INDEX IF EXISTS idx_gallery_categories_enabled;
DROP INDEX IF EXISTS idx_gallery_categories_slug;

-- Drop table
DROP TABLE IF EXISTS gallery_categories;
