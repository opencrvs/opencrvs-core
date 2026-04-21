-- Up Migration
ALTER TABLE administrative_areas ADD COLUMN external_id text UNIQUE;

-- Down Migration
ALTER TABLE administrative_areas DROP COLUMN external_id;

