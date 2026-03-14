-- Remove default gallery categories
DELETE FROM gallery_categories WHERE slug IN ('general', 'case_studies', 'diplomas', 'conferences');
