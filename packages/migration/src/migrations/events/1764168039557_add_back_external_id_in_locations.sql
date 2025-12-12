-- Up Migration
ALTER TABLE locations ADD COLUMN external_id text UNIQUE;

-- Down Migration

ALTER TABLE locations DROP COLUMN external_id;

