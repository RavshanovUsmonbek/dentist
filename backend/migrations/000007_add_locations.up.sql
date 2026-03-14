-- Create locations table for multi-location support
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50),
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    days_of_week TEXT NOT NULL, -- JSON array: ["monday", "tuesday", "wednesday"]
    hours_weekday VARCHAR(100),
    hours_saturday VARCHAR(100),
    hours_sunday VARCHAR(100),
    display_order INT NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_locations_display_order ON locations(display_order);
CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(active);

-- Add trigger for updated_at
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add setting to enable/disable multi-location feature
INSERT INTO site_settings (key, value, type, description) VALUES
('features_multi_location', 'false', 'boolean', 'Enable multi-location feature (when enabled, location management becomes available)')
ON CONFLICT (key) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE locations IS 'Multiple location support for doctors working at different places on different days';
COMMENT ON COLUMN locations.days_of_week IS 'JSON array of days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]';
