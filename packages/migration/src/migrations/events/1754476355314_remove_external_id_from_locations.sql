-- Up Migration
ALTER TABLE locations DROP COLUMN IF EXISTS external_id;

-- Down Migration
ALTER TABLE locations ADD COLUMN external_id text UNIQUE;
