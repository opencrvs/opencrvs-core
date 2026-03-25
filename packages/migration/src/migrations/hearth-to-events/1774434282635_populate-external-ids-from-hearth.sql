-- Up Migration
CREATE FOREIGN TABLE hearth_locations(
  _id        name,
  name       text,
  identifier json
) SERVER hearth_mongo OPTIONS(
  database   'hearth-dev',
  collection 'Location'
);

-- Extract Pcode from identifier (statistical-code for ADMIN_STRUCTURE, internal-id for
-- HEALTH_FACILITY/CRVS_OFFICE), strip type prefix.
-- DISTINCT ON (pcode) + ctid ensures each Pcode is assigned to at most one row,
-- guarding against duplicate location names in the database.

WITH hearth_pcodes AS (
  SELECT
    hl.name,
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
  WHERE hl.identifier IS NOT NULL
),
to_update_locations AS (
  SELECT DISTINCT ON (hp.pcode) l.ctid, hp.pcode
  FROM hearth_pcodes hp
  JOIN app.locations l ON l.name = hp.name AND l.external_id IS NULL
  WHERE hp.pcode IS NOT NULL
  ORDER BY hp.pcode, l.ctid
)
UPDATE app.locations
SET external_id = tu.pcode
FROM to_update_locations tu
WHERE app.locations.ctid = tu.ctid;

WITH hearth_pcodes AS (
  SELECT
    hl.name,
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
  WHERE hl.identifier IS NOT NULL
),
to_update_areas AS (
  SELECT DISTINCT ON (hp.pcode) aa.ctid, hp.pcode
  FROM hearth_pcodes hp
  JOIN app.administrative_areas aa ON aa.name = hp.name AND aa.external_id IS NULL
  WHERE hp.pcode IS NOT NULL
  ORDER BY hp.pcode, aa.ctid
)
UPDATE app.administrative_areas
SET external_id = tu.pcode
FROM to_update_areas tu
WHERE app.administrative_areas.ctid = tu.ctid;

DROP FOREIGN TABLE hearth_locations;

-- Down Migration
-- Cannot safely reverse: external_id values are meaningful Pcode data.
