-- Up Migration

-- Load all Hearth pcodes into a temp table (single FDW scan)
CREATE TEMP TABLE hearth_pcode_map AS
SELECT
  hl.id AS hearth_id,
  regexp_replace(
    (SELECT elem->>'value'
     FROM json_array_elements(hl.identifier) AS elem
     WHERE elem->>'system' IN (
       'http://opencrvs.org/specs/id/statistical-code',
       'http://opencrvs.org/specs/id/internal-id'
     )
     LIMIT 1),
    '^(ADMIN_STRUCTURE|HEALTH_FACILITY|CRVS_OFFICE)_', ''
  ) AS pcode
FROM hearth_locations hl
WHERE hl.identifier IS NOT NULL;

-- Update app.locations
UPDATE app.locations l
SET external_id = hp.pcode
FROM hearth_pcode_map hp
WHERE l.id::text = hp.hearth_id
  AND hp.pcode IS NOT NULL
  AND l.external_id IS NULL;

-- Update app.administrative_areas
UPDATE app.administrative_areas aa
SET external_id = hp.pcode
FROM hearth_pcode_map hp
WHERE aa.id::text = hp.hearth_id
  AND hp.pcode IS NOT NULL
  AND aa.external_id IS NULL;

DROP FOREIGN TABLE hearth_locations;

-- Down Migration
-- Cannot safely reverse: external_id values are meaningful Pcode data.
