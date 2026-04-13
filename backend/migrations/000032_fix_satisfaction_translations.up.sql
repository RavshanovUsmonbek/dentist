-- Fix inconsistent EN translation for stats_satisfaction.
-- The EN value was "90%" while UZ/RU were "100%", causing the wrong
-- value to appear when the public site language is set to English.
UPDATE site_content
SET translations = translations || '{"en": "100%"}'::jsonb,
    updated_at   = NOW()
WHERE section = 'hero' AND key = 'stats_satisfaction';
