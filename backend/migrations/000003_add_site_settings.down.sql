-- Drop triggers first
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
DROP TRIGGER IF EXISTS update_site_content_updated_at ON site_content;

-- Drop indexes
DROP INDEX IF EXISTS idx_site_settings_key;
DROP INDEX IF EXISTS idx_site_content_section;
DROP INDEX IF EXISTS idx_site_content_section_key;

-- Drop tables
DROP TABLE IF EXISTS site_content;
DROP TABLE IF EXISTS site_settings;
