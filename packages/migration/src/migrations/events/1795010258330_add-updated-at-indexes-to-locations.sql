-- Up Migration
-- Each client syncs the location and administrative area lists about once each
-- minute, with `updated_at > since - 1 minute`. Most syncs return no rows. With
-- these indexes, such a sync reads a few index pages, not the whole table.
CREATE INDEX IF NOT EXISTS idx_locations_updated_at ON app.locations(updated_at)
WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_administrative_areas_updated_at ON app.administrative_areas(updated_at)
WHERE deleted_at IS NULL;

-- Down Migration
DROP INDEX IF EXISTS app.idx_locations_updated_at;
DROP INDEX IF EXISTS app.idx_administrative_areas_updated_at;
