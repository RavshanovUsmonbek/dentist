-- Restore emergency_phone and remove secondary_phone (rollback)

-- Restore emergency_phone setting
INSERT INTO site_settings (key, value, type, description)
VALUES ('emergency_phone', '(555) 999-8888', 'string', 'Emergency contact number')
ON CONFLICT (key) DO NOTHING;

-- Remove secondary_phone setting
DELETE FROM site_settings WHERE key = 'business_phone_secondary';
