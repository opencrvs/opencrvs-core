-- Up Migration
ALTER TABLE locations DROP COLUMN parent_id;

-- Down Migration
ALTER TABLE locations ADD COLUMN parent_id uuid REFERENCES locations(id);
UPDATE locations SET parent_id = administrative_area_id
