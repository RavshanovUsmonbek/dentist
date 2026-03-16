-- Remove gallery content from site_content table
-- Gallery categories now have their own description field
DELETE FROM site_content WHERE section = 'gallery';

-- Remove gallery enable settings from site_settings
-- Categories are now managed directly in gallery_categories table
DELETE FROM site_settings WHERE key IN (
    'gallery_enable_case_studies',
    'gallery_enable_diplomas',
    'gallery_enable_conferences',
    'gallery_enable_general'
);
