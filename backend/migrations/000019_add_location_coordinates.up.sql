-- Add latitude and longitude columns to locations table
ALTER TABLE locations ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE locations ADD COLUMN longitude DECIMAL(11, 8);
