-- Merge welcome_text and philosophy_text into about_text as HTML
INSERT INTO site_content (section, key, value, type)
SELECT
  'about',
  'about_text',
  '<p>' || COALESCE(welcome.value, '') || '</p><p>' || COALESCE(philosophy.value, '') || '</p>',
  'html'
FROM site_content welcome
LEFT JOIN site_content philosophy
  ON philosophy.section = 'about' AND philosophy.key = 'philosophy_text'
WHERE welcome.section = 'about' AND welcome.key = 'welcome_text'
ON CONFLICT (section, key) DO NOTHING;
