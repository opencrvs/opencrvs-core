-- Up Migration

-- Drops the mongo_fdw extension left behind by the v2.0 legacy-data migration.
--
-- v2.0 created `mongo_fdw`, the `mongo` foreign server, its user mapping and
-- the `legacy_*` foreign tables to read the old MongoDB, but only ever dropped
-- them in its *down* migrations — so a database that came through v2.0 still
-- carries them. v2.1 moves the Postgres image back to the official
-- `postgres:17.6`, which does not ship `mongo_fdw.so`. Nothing at runtime
-- touches those objects, but `pg_dump` still emits `CREATE EXTENSION mongo_fdw`,
-- so a logical restore into a v2.1 cluster fails on a wrapper that cannot be
-- installed.
--
-- Dropping an extension requires owning it, and it is owned by the superuser
-- that ran the legacy migration (`EVENTS_SUPERUSER_POSTGRES_URL`), not by the
-- role that runs this migration set. So this only succeeds where the migration
-- role happens to be privileged, and otherwise says what to run by hand rather
-- than failing the deployment. Kubernetes deployments do not need that: the
-- superuser `postgres-on-deploy` job drops it on every deploy.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'mongo_fdw') THEN
    RETURN;
  END IF;

  BEGIN
    EXECUTE 'DROP EXTENSION mongo_fdw CASCADE';
    RAISE NOTICE 'Dropped the mongo_fdw extension left behind by the v2.0 legacy-data migration.';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE WARNING 'mongo_fdw is still installed and this migration role does not own it, so it could not be dropped. Run "DROP EXTENSION mongo_fdw CASCADE;" against this database as a Postgres superuser. Until then, a logical restore (pg_dump/pg_restore) of this database into a v2.1 cluster fails, because the Postgres image no longer ships mongo_fdw. Nothing at runtime depends on it.';
  END;
END
$$;

-- Down Migration

-- Not reversible. mongo_fdw existed only to read data out of MongoDB during the
-- v2.0 upgrade; both the wrapper's shared library and the MongoDB it pointed at
-- are gone in v2.1, so it cannot be recreated.
