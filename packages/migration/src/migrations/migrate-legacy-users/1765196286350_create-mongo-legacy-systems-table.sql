-- Up Migration
CREATE FOREIGN TABLE legacy_systems(
  _id             name,
  name            text,
  "createdBy"     text,
  scope           json,
  "secretHash"    text,
  salt            text,
  sha_secret      text,
  status          text,
  "creationDate"  bigint
) SERVER mongo OPTIONS(
  database 'user-mgnt',
  collection 'systems'
);

-- Down Migration
DROP FOREIGN TABLE legacy_systems;
