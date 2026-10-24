-- Up Migration
ALTER TABLE events ADD COLUMN IF NOT EXISTS config_version_id text;

COMMENT ON COLUMN events.config_version_id IS 'Id of the event configuration version the record was created under. NULL: created before versioning, the earliest version applies.';

-- Down Migration
ALTER TABLE events DROP COLUMN IF EXISTS config_version_id;
