-- Seed services data (migrated from frontend/src/data/services.js)
INSERT INTO services (title, description, icon, display_order, active) VALUES
('General Dentistry', 'Comprehensive dental checkups, cleanings, and preventive care to maintain your oral health.', 'FaTooth', 1, true),
('Cosmetic Dentistry', 'Transform your smile with teeth whitening, veneers, and professional smile makeovers.', 'FaSmile', 2, true),
('Dental Implants', 'Permanent, natural-looking solution for missing teeth with advanced implant technology.', 'FaTeeth', 3, true),
('Orthodontics', 'Straighten your teeth with traditional braces or modern clear aligner systems.', 'FaTooth', 4, true),
('Root Canal Treatment', 'Pain-free root canal therapy to save infected teeth and relieve discomfort.', 'FaStethoscope', 5, true),
('Emergency Dental Care', 'Immediate attention for dental emergencies, toothaches, and urgent oral health issues.', 'FaAmbulance', 6, true);

-- Seed testimonials data (migrated from frontend/src/data/testimonials.js)
INSERT INTO testimonials (name, initials, rating, text, display_order, active) VALUES
('Sarah Johnson', 'SJ', 5, 'Best dental experience I''ve ever had! The staff is incredibly professional and caring. My teeth have never looked better.', 1, true),
('Michael Chen', 'MC', 5, 'I was nervous about my dental implant procedure, but Dr. Smith made me feel completely at ease. The results exceeded my expectations!', 2, true),
('Emily Rodriguez', 'ER', 5, 'Fantastic service from start to finish. The office is modern, clean, and the entire team is friendly and knowledgeable. Highly recommend!', 3, true),
('David Thompson', 'DT', 5, 'After years of avoiding the dentist, I finally found a practice I trust. They take the time to explain everything and make you feel comfortable.', 4, true),
('Jessica Martinez', 'JM', 5, 'My smile transformation with veneers has changed my life! Thank you for the exceptional care and attention to detail.', 5, true),
('Robert Wilson', 'RW', 5, 'Emergency visit was handled promptly and professionally. They got me in right away and relieved my pain quickly. Forever grateful!', 6, true);

-- Create default admin user
-- Default credentials: username=admin, password=admin123
-- Password hash for 'admin123' using bcrypt (cost 10)
-- IMPORTANT: Change this password immediately after first login!
INSERT INTO admin_users (username, email, password_hash, full_name, active) VALUES
('admin', 'admin@smiledental.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Administrator', true);
