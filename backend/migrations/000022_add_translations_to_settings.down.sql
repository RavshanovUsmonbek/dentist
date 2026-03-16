-- Remove indexes
DROP INDEX IF EXISTS idx_site_settings_translations;
DROP INDEX IF EXISTS idx_site_content_translations;

-- Remove translations columns
ALTER TABLE site_settings DROP COLUMN IF EXISTS translations;
ALTER TABLE site_content DROP COLUMN IF EXISTS translations;
