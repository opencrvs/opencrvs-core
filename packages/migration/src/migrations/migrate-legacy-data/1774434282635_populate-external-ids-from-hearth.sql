-- Up Migration

-- Load all Hearth pcodes into a temp table (single FDW scan)
CREATE TEMP TABLE hearth_pcode_map AS
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
WHERE hl.identifier IS NOT NULL;

-- Batch-update app.locations
DO $$
DECLARE
  batch_size CONSTANT INT := ${POPULATE_EXTERNAL_ID_BATCH_SIZE};
  processed  INT;
BEGIN
  LOOP
    WITH to_update AS (
      SELECT DISTINCT ON (hp.pcode) l.ctid, hp.pcode
      FROM hearth_pcode_map hp
      JOIN app.locations l ON l.name = hp.name AND l.external_id IS NULL
      WHERE hp.pcode IS NOT NULL
      ORDER BY hp.pcode, l.ctid
      LIMIT batch_size
    )
    UPDATE app.locations SET external_id = tu.pcode
    FROM to_update tu WHERE app.locations.ctid = tu.ctid;
    GET DIAGNOSTICS processed = ROW_COUNT;
    EXIT WHEN processed = 0;
  END LOOP;
END $$;

-- Batch-update app.administrative_areas
DO $$
DECLARE
  batch_size CONSTANT INT := ${POPULATE_EXTERNAL_ID_BATCH_SIZE};
  processed  INT;
BEGIN
  LOOP
    WITH to_update AS (
      SELECT DISTINCT ON (hp.pcode) aa.ctid, hp.pcode
      FROM hearth_pcode_map hp
      JOIN app.administrative_areas aa ON aa.name = hp.name AND aa.external_id IS NULL
      WHERE hp.pcode IS NOT NULL
      ORDER BY hp.pcode, aa.ctid
      LIMIT batch_size
    )
    UPDATE app.administrative_areas SET external_id = tu.pcode
    FROM to_update tu WHERE app.administrative_areas.ctid = tu.ctid;
    GET DIAGNOSTICS processed = ROW_COUNT;
    EXIT WHEN processed = 0;
  END LOOP;
END $$;

DROP FOREIGN TABLE hearth_locations;

-- Down Migration
-- Cannot safely reverse: external_id values are meaningful Pcode data.
