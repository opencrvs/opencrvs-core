-- Up Migration
-- A constant default fills existing rows without rewriting the table: records created
-- before versioning are stamped with the initial version.
ALTER TABLE events ADD COLUMN IF NOT EXISTS config_version_id text NOT NULL DEFAULT 'initial';

-- New records must be stamped explicitly.
ALTER TABLE events ALTER COLUMN config_version_id DROP DEFAULT;

COMMENT ON COLUMN events.config_version_id IS 'Id of the event configuration version the record was created under. ''initial'' for records created before versioning.';

-- Down Migration
ALTER TABLE events DROP COLUMN IF EXISTS config_version_id;
