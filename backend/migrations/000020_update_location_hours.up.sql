-- Add business_hours JSONB column to locations table
ALTER TABLE locations ADD COLUMN business_hours JSONB;

-- Drop old hour columns
ALTER TABLE locations DROP COLUMN IF EXISTS hours_weekday;
ALTER TABLE locations DROP COLUMN IF EXISTS hours_saturday;
ALTER TABLE locations DROP COLUMN IF EXISTS hours_sunday;
