#!/bin/bash
# This script initializes and configures a PostgreSQL database for OpenCRVS services.
# It waits for PostgreSQL to be ready, checks if the target database exists, creates it if necessary,
# sets up roles and passwords, creates the 'app' schema if missing, and configures privileges for roles.
# The script is idempotent and safe to run multiple times.

set -euo pipefail

# Configuration
: "${POSTGRES_HOST:=postgres}"
: "${POSTGRES_PORT:=5432}"
: "${POSTGRES_USER:?Must set POSTGRES_USER}"
: "${POSTGRES_PASSWORD:?Must set POSTGRES_PASSWORD}"
: "${EVENTS_MIGRATOR_POSTGRES_PASSWORD:?Must set EVENTS_MIGRATOR_POSTGRES_PASSWORD}"
: "${EVENTS_APP_POSTGRES_PASSWORD:?Must set EVENTS_APP_POSTGRES_PASSWORD}"
: "${ANALYTICS_POSTGRES_PASSWORD:?Must set ANALYTICS_POSTGRES_PASSWORD}"
: "${ANALYTICS_POSTGRES_USER:?Must set ANALYTICS_POSTGRES_USER}"
: "${EVENTS_APP_ROLE:=events_app}"
: "${EVENTS_MIGRATOR_ROLE:=events_migrator}"
: "${KEEP_ALIVE_SECONDS:=0}" # Prevent Swarm from marking this task as failed due to early exit
: "${TARGET_DB:=events}"


TARGET_DB=${TARGET_DB//-/_}
export PGPASSWORD="$POSTGRES_PASSWORD"


create_or_update_role() {
  local role=$1
  local password=$2
  local db=$3
  echo "Creating or updating role '$role' with access to database '$db'..."
  PGPASSWORD="$POSTGRES_PASSWORD" psql -v ON_ERROR_STOP=1 -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d postgres <<EOSQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${role}') THEN
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', '${role}', '${password}');
  ELSE
    EXECUTE format('ALTER ROLE %I WITH PASSWORD %L', '${role}', '${password}');
  END IF;

  EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', '${db}', '${role}');
END
\$\$;
EOSQL
}

echo "Waiting for PostgreSQL to be ready at ${POSTGRES_HOST}:${POSTGRES_PORT}..."
until psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" -d postgres -c '\q' 2>/dev/null; do
  sleep 2
done

# Prevent Swarm from marking this task as failed due to early exit
sleep 10

echo "Checking if database '$TARGET_DB' exists..."
DB_EXISTS=$(psql -qtAX -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" -d postgres \
  -c "SELECT 1 FROM pg_database WHERE datname = '$TARGET_DB';")

echo "[1/3] Cluster-wide setup..."
if [[ "$DB_EXISTS" == "1" ]]; then
  echo "✅ Database '$TARGET_DB' already exists."
else
  echo "Database '$TARGET_DB' does not exist. Proceeding with initialization."
  psql -v ON_ERROR_STOP=1 -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d postgres \
       -c "CREATE DATABASE ${TARGET_DB};" || { echo "❌ Cluster-wide SQL failed"; exit 1; }
fi

create_or_update_role "$EVENTS_MIGRATOR_ROLE" "$EVENTS_MIGRATOR_POSTGRES_PASSWORD" "$TARGET_DB"
create_or_update_role "$EVENTS_APP_ROLE" "$EVENTS_APP_POSTGRES_PASSWORD" "$TARGET_DB"
create_or_update_role "$ANALYTICS_POSTGRES_USER" "$ANALYTICS_POSTGRES_PASSWORD" "$TARGET_DB"

echo "Checking if schema app in DB '$TARGET_DB' exists..."
SCHEMA_EXISTS=$(psql -qtAX -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" -d $TARGET_DB \
  -c "SELECT 1 FROM information_schema.schemata WHERE schema_name = 'app';")

echo "[2/3] Database-specific setup..."
if [[ "$SCHEMA_EXISTS" != "1" ]]; then
  psql -v ON_ERROR_STOP=1 -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" -d "$TARGET_DB" <<EOF || { echo "❌ DB-specific SQL failed"; exit 1; }
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM ${EVENTS_MIGRATOR_ROLE};
CREATE SCHEMA app AUTHORIZATION ${EVENTS_MIGRATOR_ROLE};
EOF

echo "✅ Database '$TARGET_DB' initialized successfully."
else
  echo "✅ Schema 'app' already exists in database '$TARGET_DB'. Skipping DB-specific setup."
fi
echo "[3/3] Schema-specific setup..."
psql -v ON_ERROR_STOP=1 -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" -d "$TARGET_DB" <<EOF || { echo "❌ DB-specific SQL failed"; exit 1; }
GRANT USAGE ON SCHEMA app TO ${EVENTS_APP_ROLE};
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO ${EVENTS_APP_ROLE};
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${EVENTS_APP_ROLE};
EOF

sleep "$KEEP_ALIVE_SECONDS"

echo "✅ PostgreSQL setup completed successfully."
