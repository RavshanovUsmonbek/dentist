-- Remove seeded data (in reverse order)
DELETE FROM admin_users WHERE username = 'admin';
DELETE FROM testimonials WHERE name IN ('Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Thompson', 'Jessica Martinez', 'Robert Wilson');
DELETE FROM services WHERE title IN ('General Dentistry', 'Cosmetic Dentistry', 'Dental Implants', 'Orthodontics', 'Root Canal Treatment', 'Emergency Dental Care');
