-- Revert entity translations to uz-only (original state from migration 023)
UPDATE services SET translations = jsonb_build_object(
  'title', jsonb_build_object('uz', title),
  'description', jsonb_build_object('uz', description)
);
UPDATE testimonials SET translations = jsonb_build_object(
  'name', jsonb_build_object('uz', name),
  'text', jsonb_build_object('uz', text)
);
UPDATE locations SET translations = jsonb_build_object(
  'name', jsonb_build_object('uz', name),
  'address', jsonb_build_object('uz', address)
);
UPDATE gallery_categories SET translations = jsonb_build_object(
  'label', jsonb_build_object('uz', label),
  'description', jsonb_build_object('uz', COALESCE(description, ''))
);
