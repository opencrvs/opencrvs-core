-- Up Migration
CREATE FOREIGN TABLE hearth_locations(
  _id        name,
  id         text,
  identifier json
) SERVER mongo OPTIONS(
  database   'hearth-dev',
  collection 'Location'
);

-- Down Migration
DROP FOREIGN TABLE IF EXISTS hearth_locations;
