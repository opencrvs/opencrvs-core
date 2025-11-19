-- Up Migration
UPDATE
  locations
SET
  administrative_area_id = parent_id
WHERE
  location_type = 'ADMIN_STRUCTURE';

-- Down Migration
UPDATE
  locations
SET
  administrative_area_id = NULL
WHERE
  location_type = 'ADMIN_STRUCTURE';