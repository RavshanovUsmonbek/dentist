-- Drop triggers
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
DROP TRIGGER IF EXISTS update_gallery_images_updated_at ON gallery_images;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_contact_submissions_created_at;
DROP INDEX IF EXISTS idx_contact_submissions_read;
DROP INDEX IF EXISTS idx_services_display_order;
DROP INDEX IF EXISTS idx_services_active;
DROP INDEX IF EXISTS idx_testimonials_display_order;
DROP INDEX IF EXISTS idx_testimonials_active;
DROP INDEX IF EXISTS idx_gallery_images_display_order;
DROP INDEX IF EXISTS idx_gallery_images_active;
DROP INDEX IF EXISTS idx_admin_users_username;
DROP INDEX IF EXISTS idx_admin_users_email;
DROP INDEX IF EXISTS idx_admin_users_active;

-- Drop tables
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS gallery_images;
DROP TABLE IF EXISTS testimonials;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS contact_submissions;
