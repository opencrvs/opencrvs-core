-- Up Migration
ALTER TABLE locations ALTER COLUMN location_type TYPE text USING location_type::text;

-- Down Migration
ALTER TABLE locations ALTER COLUMN location_type TYPE location_type USING location_type::location_type;
