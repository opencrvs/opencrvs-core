# https://github.com/oguimbal/pg-mem/wiki/FAQ#-how-to-import-my-production-schema-in-pg-mem-
docker run --rm \
  -e PGPASSWORD=migrator_password \
  postgres:17 \
  pg_dump \
    --schema-only \
    --no-owner \
    --no-acl \
    --disable-triggers \
    --no-comments \
    --no-publications \
    --no-security-labels \
    --no-subscriptions \
    --no-tablespaces \
    --host=host.docker.internal \
    --port=5432 \
    --username=events_migrator \
    events \
| sed -e 's/\bapp\./public./g' \
      -e 's/^CREATE SCHEMA app;/-- CREATE SCHEMA app;/' \
> events.sql

# sed is due to search_path not working on pg_mem, so lets just dump everything into public schema
