-- Restore days_of_week column
ALTER TABLE locations ADD COLUMN days_of_week TEXT NOT NULL DEFAULT '[]';
