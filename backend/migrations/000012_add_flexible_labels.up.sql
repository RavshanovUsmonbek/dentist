-- Add dynamic content for testimonials section
INSERT INTO site_content (section, key, value, type) VALUES
('testimonials', 'title', 'Client Testimonials', 'string'),
('testimonials', 'subtitle', 'Hear what our clients have to say about their experience', 'text')
ON CONFLICT (section, key) DO NOTHING;

-- Add dynamic labels for contact section
INSERT INTO site_content (section, key, value, type) VALUES
('contact', 'hours_title', 'Business Hours', 'string'),
('contact', 'emergency_title', 'Emergency Contact', 'string'),
('contact', 'emergency_text', 'For urgent matters, please call us directly.', 'text')
ON CONFLICT (section, key) DO NOTHING;

-- Add dynamic labels for footer
INSERT INTO site_content (section, key, value, type) VALUES
('footer', 'hours_title', 'Hours', 'string')
ON CONFLICT (section, key) DO NOTHING;
