-- Up Migration
ALTER TABLE administrative_areas ADD COLUMN IF NOT EXISTS external_id text UNIQUE;

-- Down Migration
ALTER TABLE administrative_areas DROP COLUMN external_id;

