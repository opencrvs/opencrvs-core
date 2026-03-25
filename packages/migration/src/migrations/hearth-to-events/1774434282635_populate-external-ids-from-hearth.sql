-- Up Migration
CREATE FOREIGN TABLE hearth_locations(
  _id  name,
  id   text,
  name text
) SERVER hearth_mongo OPTIONS(
  database   'hearth-dev',
  collection 'Location'
);

UPDATE app.locations l
SET external_id = hl.id
FROM hearth_locations hl
WHERE l.name = hl.name
  AND l.external_id IS NULL;

UPDATE app.administrative_areas aa
SET external_id = hl.id
FROM hearth_locations hl
WHERE aa.name = hl.name
  AND aa.external_id IS NULL;

DROP FOREIGN TABLE hearth_locations;

-- Down Migration
-- Cannot safely reverse: external_id values are meaningful Pcode data.
