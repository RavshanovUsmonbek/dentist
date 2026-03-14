-- Simplify locations table for Uzbekistan-focused usage
-- Remove: address_line2, city, state, postal_code, phone, email
-- Add: single 'address' field

-- Step 1: Add new 'address' column
ALTER TABLE locations ADD COLUMN address VARCHAR(500);

-- Step 2: Migrate existing data to new column
-- Combine address_line1, address_line2, city into single address
UPDATE locations
SET address = CASE
    WHEN address_line2 != '' AND address_line2 IS NOT NULL THEN
        address_line1 || ', ' || address_line2 || ', ' || city
    ELSE
        address_line1 || ', ' || city
END;

-- Step 3: Make address NOT NULL after data migration
ALTER TABLE locations ALTER COLUMN address SET NOT NULL;

-- Step 4: Drop old address-related columns
ALTER TABLE locations DROP COLUMN address_line1;
ALTER TABLE locations DROP COLUMN address_line2;
ALTER TABLE locations DROP COLUMN city;
ALTER TABLE locations DROP COLUMN state;
ALTER TABLE locations DROP COLUMN postal_code;

-- Step 5: Drop contact info columns (moved to site_settings)
ALTER TABLE locations DROP COLUMN phone;
ALTER TABLE locations DROP COLUMN email;

-- Step 6: Remove address from site_settings (addresses now only in locations)
DELETE FROM site_settings WHERE key IN ('business_address_line1', 'business_address_line2');

-- Step 7: Update business_phone description to support multiple
UPDATE site_settings
SET description = 'Business phone numbers (comma-separated for multiple)'
WHERE key = 'business_phone';
