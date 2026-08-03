-- Up Migration
ALTER TABLE app.events ADD COLUMN config_version text;

COMMENT ON COLUMN app.events.config_version IS 'The form config version this event is pinned to, recorded at creation time. NULL for events created before form versioning existed; resolution falls back to the version active on created_at for those.';

-- Down Migration
ALTER TABLE app.events DROP COLUMN config_version;
