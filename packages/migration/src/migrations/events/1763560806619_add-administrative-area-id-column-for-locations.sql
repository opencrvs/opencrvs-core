-- Up Migration
ALTER TABLE locations ADD COLUMN administrative_area_id uuid REFERENCES administrative_areas(id);

-- Down Migration
ALTER TABLE locations DROP COLUMN administrative_area_id;
