-- Restore gallery content to site_content table
INSERT INTO site_content (section, key, value, type) VALUES
('gallery', 'title_general', 'Gallery', 'string'),
('gallery', 'subtitle_general', 'Take a look at our professional work and achievements.', 'text'),
('gallery', 'title_case_studies', 'Case Studies', 'string'),
('gallery', 'subtitle_case_studies', 'Before and after treatment results showcasing professional expertise.', 'text'),
('gallery', 'title_diplomas', 'Certifications', 'string'),
('gallery', 'subtitle_diplomas', 'Professional qualifications, certifications, and awards.', 'text'),
('gallery', 'title_conferences', 'Professional Events', 'string'),
('gallery', 'subtitle_conferences', 'Conferences, seminars, and continuing education activities.', 'text')
ON CONFLICT (section, key) DO NOTHING;

-- Restore gallery enable settings to site_settings
INSERT INTO site_settings (key, value, type, description) VALUES
('gallery_enable_case_studies', 'true', 'boolean', 'Enable Case Studies gallery category'),
('gallery_enable_diplomas', 'true', 'boolean', 'Enable Diplomas & Certifications category'),
('gallery_enable_conferences', 'true', 'boolean', 'Enable Conferences & Events category'),
('gallery_enable_general', 'true', 'boolean', 'Enable General gallery category')
ON CONFLICT (key) DO NOTHING;
