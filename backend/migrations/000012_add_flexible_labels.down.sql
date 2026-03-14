-- Remove flexible labels from testimonials
DELETE FROM site_content WHERE section = 'testimonials' AND key IN ('title', 'subtitle');

-- Remove flexible labels from contact
DELETE FROM site_content WHERE section = 'contact' AND key IN ('hours_title', 'emergency_title', 'emergency_text');

-- Remove flexible labels from footer
DELETE FROM site_content WHERE section = 'footer' AND key = 'hours_title';
