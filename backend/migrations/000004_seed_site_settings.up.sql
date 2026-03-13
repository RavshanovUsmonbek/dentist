-- Seed business settings
INSERT INTO site_settings (key, value, type, description) VALUES
('business_name', 'Smile Dental Care', 'string', 'Business name displayed in header and footer'),
('business_phone', '(555) 123-4567', 'string', 'Main contact phone number'),
('business_email', 'info@smiledentalcare.com', 'string', 'Main contact email'),
('business_address_line1', '123 Dental Street, Suite 100', 'string', 'Business address line 1'),
('business_address_line2', 'Your City, ST 12345', 'string', 'Business address line 2'),
('emergency_phone', '(555) 999-8888', 'string', 'Emergency contact number'),
('hours_weekday', '8:00 AM - 6:00 PM', 'string', 'Monday-Friday hours'),
('hours_saturday', '9:00 AM - 3:00 PM', 'string', 'Saturday hours'),
('hours_sunday', 'Closed', 'string', 'Sunday hours'),
('social_facebook', '', 'string', 'Facebook page URL'),
('social_twitter', '', 'string', 'Twitter profile URL'),
('social_instagram', '', 'string', 'Instagram profile URL')
ON CONFLICT (key) DO NOTHING;

-- Seed Hero section content
INSERT INTO site_content (section, key, value, type) VALUES
('hero', 'title', 'Your Smile, Our Priority', 'string'),
('hero', 'subtitle', 'Experience exceptional dental care with state-of-the-art technology and a compassionate team dedicated to your oral health.', 'text'),
('hero', 'cta_primary_text', 'Schedule Appointment', 'string'),
('hero', 'cta_secondary_text', 'Our Services', 'string')
ON CONFLICT (section, key) DO NOTHING;

-- Seed About section content
INSERT INTO site_content (section, key, value, type) VALUES
('about', 'doctor_name', 'Dr. Sarah Smith, DDS', 'string'),
('about', 'doctor_photo', '', 'image'),
('about', 'welcome_text', 'Welcome to Smile Dental Care! I''m Dr. Sarah Smith, and I''ve been passionate about dentistry for over 15 years. My commitment is to provide you with the highest quality dental care in a comfortable, welcoming environment.', 'text'),
('about', 'philosophy_text', 'I believe that every patient deserves personalized attention and a treatment plan tailored to their unique needs. Whether you''re here for a routine cleaning or a complete smile makeover, you can trust that you''re in capable, caring hands.', 'text'),
('about', 'education', '["Doctor of Dental Surgery, University of California", "Advanced Cosmetic Dentistry Certification"]', 'json'),
('about', 'experience', '["15+ years of dental practice", "Specialist in cosmetic and restorative dentistry"]', 'json'),
('about', 'awards', '["American Dental Association Member", "Best Dentist Award 2023"]', 'json')
ON CONFLICT (section, key) DO NOTHING;

-- Seed Contact section content
INSERT INTO site_content (section, key, value, type) VALUES
('contact', 'title', 'Contact Us', 'string'),
('contact', 'subtitle', 'Have questions or want to schedule an appointment? We''d love to hear from you. Fill out the form below or give us a call.', 'text'),
('contact', 'form_title', 'Send us a Message', 'string'),
('contact', 'success_message', 'Thank you for contacting us! We''ll get back to you soon.', 'text'),
('contact', 'emergency_text', 'If you have a dental emergency outside of our regular hours, please call our emergency line.', 'text')
ON CONFLICT (section, key) DO NOTHING;

-- Seed Footer content
INSERT INTO site_content (section, key, value, type) VALUES
('footer', 'description', 'Providing exceptional dental care with compassion and expertise. Your smile is our priority.', 'text'),
('footer', 'copyright_text', 'Smile Dental Care. All rights reserved.', 'string')
ON CONFLICT (section, key) DO NOTHING;
