-- Up Migration
DELETE FROM
  locations
WHERE
  location_type = 'ADMIN_STRUCTURE';

-- Down Migration
INSERT INTO
  locations (
    id,
    name,
    administrative_area_id,
    created_at,
    updated_at,
    deleted_at,
    valid_until,
    location_type
  )
SELECT
  id,
  name,
  parent_id as administrative_area_id,
  created_at,
  updated_at,
  deleted_at,
  valid_until,
  'ADMIN_STRUCTURE' as location_type
FROM
  administrative_areas
