-- Reverse migration: restore old locations table structure

-- Step 1: Add back old address-related columns
ALTER TABLE locations ADD COLUMN address_line1 VARCHAR(255);
ALTER TABLE locations ADD COLUMN address_line2 VARCHAR(255);
ALTER TABLE locations ADD COLUMN city VARCHAR(100);
ALTER TABLE locations ADD COLUMN state VARCHAR(50);
ALTER TABLE locations ADD COLUMN postal_code VARCHAR(20);

-- Step 2: Add back contact info columns
ALTER TABLE locations ADD COLUMN phone VARCHAR(20);
ALTER TABLE locations ADD COLUMN email VARCHAR(255);

-- Step 3: Copy address back to address_line1 (best effort)
UPDATE locations SET address_line1 = address WHERE address_line1 IS NULL;

-- Step 4: Drop simplified column
ALTER TABLE locations DROP COLUMN address;

-- Step 5: Restore address settings
INSERT INTO site_settings (key, value, type, description)
VALUES
    ('business_address_line1', '', 'string', 'Business address line 1'),
    ('business_address_line2', '', 'string', 'Business address line 2')
ON CONFLICT (key) DO NOTHING;

-- Step 6: Restore business_phone description
UPDATE site_settings
SET description = 'Business phone number'
WHERE key = 'business_phone';
