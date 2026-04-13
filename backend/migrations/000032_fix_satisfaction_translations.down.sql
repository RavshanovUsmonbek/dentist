UPDATE site_content
SET translations = translations || '{"en": "90%"}'::jsonb,
    updated_at   = NOW()
WHERE section = 'hero' AND key = 'stats_satisfaction';
