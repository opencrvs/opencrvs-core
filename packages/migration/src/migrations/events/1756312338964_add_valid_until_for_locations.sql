-- Up Migration
ALTER TABLE locations ADD COLUMN valid_until TIMESTAMP WITH TIME ZONE;

-- Down Migration
ALTER TABLE locations DROP COLUMN valid_until;
