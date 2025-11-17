-- Up Migration
CREATE FOREIGN TABLE legacy_practitioners(
  _id name,
  id text,
  extensions json
) SERVER mongo OPTIONS(
  database 'hearth-dev',
  collection 'Practitioner'
);

-- Down Migration

DROP FOREIGN TABLE legacy_practitioners;

