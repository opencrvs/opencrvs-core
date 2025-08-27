-- Up Migration
ALTER TABLE locations ADD COLUMN status text CHECK (status IN ('active', 'inactive')) DEFAULT 'active';

-- Down Migration
ALTER TABLE locations DROP COLUMN status;
