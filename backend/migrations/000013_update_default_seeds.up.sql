-- Update business name to be more generic
UPDATE site_settings SET value = 'Professional Services' WHERE key = 'business_name';

-- Note: Services and testimonials are kept as-is since admins can customize them through the admin panel
