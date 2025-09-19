-- Up Migration
CREATE INDEX idx_locations_active ON app.locations(id, name, parent_id, valid_until, location_type)
WHERE deleted_at IS NULL;
CREATE INDEX idx_locations_valid_until ON app.locations(valid_until);
CREATE INDEX idx_locations_parent_type ON app.locations(parent_id, location_type);
-- Down Migration
DROP INDEX idx_locations_deleted_at;
DROP INDEX idx_locations_valid_until;
DROP INDEX idx_locations_parent_type;