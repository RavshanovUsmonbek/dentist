-- Add translations JSONB column to site_settings
ALTER TABLE site_settings ADD COLUMN translations JSONB DEFAULT '{}'::jsonb;

-- Add translations JSONB column to site_content
ALTER TABLE site_content ADD COLUMN translations JSONB DEFAULT '{}'::jsonb;

-- Migrate existing data to Uzbek translations
UPDATE site_settings SET translations = jsonb_build_object('uz', value);
UPDATE site_content SET translations = jsonb_build_object('uz', value);

-- Create GIN indexes for JSONB queries
CREATE INDEX idx_site_settings_translations ON site_settings USING gin(translations);
CREATE INDEX idx_site_content_translations ON site_content USING gin(translations);
