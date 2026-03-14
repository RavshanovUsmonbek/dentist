-- Seed sample location data (only if table is empty)
INSERT INTO locations (name, address_line1, city, state, postal_code, phone, email, days_of_week, hours_weekday, hours_saturday, hours_sunday, display_order, active)
SELECT * FROM (VALUES
    ('Main Office', '123 Medical Plaza, Suite 100', 'Downtown', 'CA', '90001', '(555) 123-4567', 'main@doctor.com', '["monday", "tuesday", "wednesday"]', '8:00 AM - 6:00 PM', 'Closed', 'Closed', 1, true),
    ('West Side Clinic', '456 West Avenue, Floor 2', 'West Side', 'CA', '90002', '(555) 987-6543', 'west@doctor.com', '["thursday", "friday"]', '9:00 AM - 5:00 PM', '9:00 AM - 1:00 PM', 'Closed', 2, true)
) AS sample_data
WHERE NOT EXISTS (SELECT 1 FROM locations);
