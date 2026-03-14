-- Add dynamic content for services/specializations section
INSERT INTO site_content (section, key, value, type) VALUES
('services', 'title', 'Our Services', 'string'),
('services', 'subtitle', 'Comprehensive professional services tailored to your needs', 'text')
ON CONFLICT (section, key) DO NOTHING;
