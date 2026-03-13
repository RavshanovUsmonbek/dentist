-- Create site_settings table for business configuration
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'string',
    description VARCHAR(500),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create site_content table for section-based dynamic content
CREATE TABLE IF NOT EXISTS site_content (
    id SERIAL PRIMARY KEY,
    section VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'string',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(section, key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section);
CREATE INDEX IF NOT EXISTS idx_site_content_section_key ON site_content(section, key);

-- Create triggers for updated_at
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON site_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
