-- Remove gallery category settings
DELETE FROM site_settings WHERE key IN (
    'gallery_enable_case_studies',
    'gallery_enable_diplomas',
    'gallery_enable_conferences',
    'gallery_enable_general'
);

-- Remove gallery content
DELETE FROM site_content WHERE section = 'gallery';
