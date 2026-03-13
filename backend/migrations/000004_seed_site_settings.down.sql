-- Remove seeded site content
DELETE FROM site_content WHERE section IN ('hero', 'about', 'contact', 'footer');

-- Remove seeded site settings
DELETE FROM site_settings WHERE key IN (
    'business_name',
    'business_phone',
    'business_email',
    'business_address_line1',
    'business_address_line2',
    'emergency_phone',
    'hours_weekday',
    'hours_saturday',
    'hours_sunday',
    'social_facebook',
    'social_twitter',
    'social_instagram'
);
