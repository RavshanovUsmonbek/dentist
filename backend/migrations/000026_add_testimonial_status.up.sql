ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'approved';
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
