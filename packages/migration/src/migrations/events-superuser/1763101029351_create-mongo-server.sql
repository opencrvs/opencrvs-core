-- Up Migration
CREATE EXTENSION mongo_fdw;

CREATE SERVER mongo FOREIGN DATA WRAPPER mongo_fdw OPTIONS(
  address 'mongo1',
  port '27017'
);

GRANT USAGE ON FOREIGN SERVER mongo TO events_migrator;

CREATE USER MAPPING FOR events_migrator SERVER mongo;

-- Down Migration
DROP USER MAPPING FOR events_migrator SERVER mongo;

DROP SERVER mongo CASCADE;

DROP EXTENSION mongo_fdw CASCADE;
