-- Remove legacy address and hours settings from site_settings
-- These are now managed through the locations table

DELETE FROM site_settings WHERE key IN (
    'hours_weekday',
    'hours_saturday',
    'hours_sunday',
    'business_address',
    'business_city'
);
