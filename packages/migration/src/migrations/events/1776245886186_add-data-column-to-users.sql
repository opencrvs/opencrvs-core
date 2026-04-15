-- Up Migration
ALTER TABLE users ADD COLUMN data jsonb DEFAULT '{}' NOT NULL;

-- Down Migration
ALTER TABLE users DROP COLUMN data;