-- Seed default gallery categories
INSERT INTO gallery_categories (slug, label, description, display_order, enabled) VALUES
    ('general', 'General', 'General gallery images', 0, true),
    ('case_studies', 'Case Studies', 'Before and after case studies', 1, true),
    ('diplomas', 'Diplomas & Certifications', 'Professional credentials and certifications', 2, true),
    ('conferences', 'Conferences & Events', 'Professional conferences and events attended', 3, true)
ON CONFLICT (slug) DO NOTHING;
