-- Remove days_of_week column as it's now redundant with business_hours
ALTER TABLE locations DROP COLUMN IF EXISTS days_of_week;
