-- Replace emergency_phone with secondary_phone in site_settings

-- Add secondary_phone setting
INSERT INTO site_settings (key, value, type, description)
VALUES ('business_phone_secondary', '', 'string', 'Secondary business phone number')
ON CONFLICT (key) DO NOTHING;

-- Remove emergency_phone setting
DELETE FROM site_settings WHERE key = 'emergency_phone';
