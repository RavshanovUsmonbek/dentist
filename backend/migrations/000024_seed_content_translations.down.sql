-- Revert translations back to uz-only (original state from migration 000022)
UPDATE site_content SET translations = jsonb_build_object('uz', value);
