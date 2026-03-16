-- Restore legacy settings (in case of rollback)

INSERT INTO site_settings (key, value, type, description) VALUES
('hours_weekday', '8:00 AM - 6:00 PM', 'string', 'Monday-Friday hours (DEPRECATED - use locations)'),
('hours_saturday', '9:00 AM - 3:00 PM', 'string', 'Saturday hours (DEPRECATED - use locations)'),
('hours_sunday', 'Closed', 'string', 'Sunday hours (DEPRECATED - use locations)')
ON CONFLICT (key) DO NOTHING;
