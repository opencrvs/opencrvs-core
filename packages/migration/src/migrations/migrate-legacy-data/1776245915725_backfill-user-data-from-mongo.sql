-- Up Migration
-- legacy_users is a foreign table backed by mongo_fdw. Adding a column here extends
-- the schema declaration so mongo_fdw reads the 'data' field from MongoDB documents
-- in the user-mgnt.users collection. No data is stored in PostgreSQL for this table.
ALTER FOREIGN TABLE legacy_users ADD COLUMN data json;

UPDATE users
SET data = COALESCE(lu.data::jsonb, '{}')
FROM legacy_users lu
WHERE lu._id = users.legacy_id;

-- Down Migration
ALTER FOREIGN TABLE legacy_users DROP COLUMN data;