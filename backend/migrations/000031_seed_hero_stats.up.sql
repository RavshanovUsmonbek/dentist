INSERT INTO site_content (section, key, value, translations, updated_at)
VALUES
  ('hero', 'stats_years_experience', '15+', '{"uz":"15+","ru":"15+","en":"15+"}', NOW()),
  ('hero', 'stats_patients',         '2k+', '{"uz":"2k+","ru":"2k+","en":"2k+"}', NOW()),
  ('hero', 'stats_satisfaction',     '100%','{"uz":"100%","ru":"100%","en":"100%"}', NOW())
ON CONFLICT (section, key) DO NOTHING;
