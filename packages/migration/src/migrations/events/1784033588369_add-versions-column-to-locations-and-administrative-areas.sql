-- Up Migration
ALTER TABLE app.locations ADD COLUMN versions jsonb;
ALTER TABLE app.administrative_areas ADD COLUMN versions jsonb;

UPDATE app.locations
SET versions = jsonb_build_array(
    jsonb_build_object(
      'versionId', gen_random_uuid(),
      'effectiveFrom', '0001-01-01',
      'name', name,
      'externalId', external_id,
      'status', 'active'
    )
  ) || CASE
    WHEN valid_until IS NOT NULL THEN jsonb_build_array(
      jsonb_build_object(
        'versionId', gen_random_uuid(),
        'effectiveFrom', to_char(valid_until AT TIME ZONE 'UTC', 'YYYY-MM-DD'),
        'name', name,
        'externalId', external_id,
        'status', 'inactive'
      )
    )
    ELSE '[]'::jsonb
  END
WHERE versions IS NULL;

UPDATE app.administrative_areas
SET versions = jsonb_build_array(
    jsonb_build_object(
      'versionId', gen_random_uuid(),
      'effectiveFrom', '0001-01-01',
      'name', name,
      'externalId', external_id,
      'status', 'active'
    )
  ) || CASE
    WHEN valid_until IS NOT NULL THEN jsonb_build_array(
      jsonb_build_object(
        'versionId', gen_random_uuid(),
        'effectiveFrom', to_char(valid_until AT TIME ZONE 'UTC', 'YYYY-MM-DD'),
        'name', name,
        'externalId', external_id,
        'status', 'inactive'
      )
    )
    ELSE '[]'::jsonb
  END
WHERE versions IS NULL;

ALTER TABLE app.locations
  ADD CONSTRAINT locations_versions_nonempty
  CHECK (jsonb_typeof(versions) = 'array' AND jsonb_array_length(versions) >= 1);

ALTER TABLE app.administrative_areas
  ADD CONSTRAINT administrative_areas_versions_nonempty
  CHECK (jsonb_typeof(versions) = 'array' AND jsonb_array_length(versions) >= 1);

ALTER TABLE app.locations ALTER COLUMN versions SET NOT NULL;
ALTER TABLE app.administrative_areas ALTER COLUMN versions SET NOT NULL;

-- Down Migration
ALTER TABLE app.locations DROP COLUMN versions;
ALTER TABLE app.administrative_areas DROP COLUMN versions;
