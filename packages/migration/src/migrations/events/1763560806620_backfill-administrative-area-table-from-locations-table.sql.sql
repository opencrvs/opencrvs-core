-- Up Migration
INSERT INTO
  administrative_areas (
    id,
    name,
    parent_id,
    created_at,
    updated_at,
    deleted_at,
    valid_until
  )
SELECT
  id,
  name,
  parent_id,
  created_at,
  updated_at,
  deleted_at,
  valid_until
FROM
  locations
WHERE
  location_type = 'ADMIN_STRUCTURE';

-- Down Migration
DELETE FROM
  administrative_areas
WHERE
  1 = 1;