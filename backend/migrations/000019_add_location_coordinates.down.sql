-- Remove latitude and longitude columns from locations table
ALTER TABLE locations DROP COLUMN IF EXISTS latitude;
ALTER TABLE locations DROP COLUMN IF EXISTS longitude;
