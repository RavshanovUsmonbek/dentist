-- Restore old hour columns
ALTER TABLE locations ADD COLUMN hours_weekday VARCHAR(100);
ALTER TABLE locations ADD COLUMN hours_saturday VARCHAR(100);
ALTER TABLE locations ADD COLUMN hours_sunday VARCHAR(100);

-- Drop business_hours column
ALTER TABLE locations DROP COLUMN IF EXISTS business_hours;
