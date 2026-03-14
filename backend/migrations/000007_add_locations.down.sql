-- Remove multi-location feature setting
DELETE FROM site_settings WHERE key = 'features_multi_location';

-- Drop triggers and indexes
DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
DROP INDEX IF EXISTS idx_locations_active;
DROP INDEX IF EXISTS idx_locations_display_order;

-- Drop locations table
DROP TABLE IF EXISTS locations;
