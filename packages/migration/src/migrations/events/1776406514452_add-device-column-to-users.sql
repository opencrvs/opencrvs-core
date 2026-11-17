-- Up Migration
ALTER TABLE users ADD COLUMN device text NULL;

-- Down Migration
ALTER TABLE users DROP COLUMN device;
