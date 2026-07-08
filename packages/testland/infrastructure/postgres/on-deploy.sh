#!/bin/bash
set -euo pipefail

# Configuration
: "${POSTGRES_HOST:=postgres}"
: "${POSTGRES_PORT:=5432}"
: "${POSTGRES_USER:?Must set POSTGRES_USER}"
: "${POSTGRES_PASSWORD:?Must set POSTGRES_PASSWORD}"
: "${EVENTS_MIGRATOR_POSTGRES_PASSWORD:?Must set EVENTS_MIGRATOR_POSTGRES_PASSWORD}"
: "${EVENTS_APP_POSTGRES_PASSWORD:?Must set EVENTS_APP_POSTGRES_PASSWORD}"
: "${KEEP_ALIVE_SECONDS:=0}" # Prevent Swarm from marking this task as failed due to early exit

TARGET_DB="events"

echo "Waiting for PostgreSQL to be ready at ${POSTGRES_HOST}:${POSTGRES_PORT}..."
until PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" -d postgres -c '\q' 2>/dev/null; do
  sleep 2
done

sleep "$KEEP_ALIVE_SECONDS"

echo "Checking if database '$TARGET_DB' exists..."
DB_EXISTS=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -qtAX -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" -d postgres \
  -c "SELECT 1 FROM pg_database WHERE datname = '$TARGET_DB';")

if [[ "$DB_EXISTS" == "1" ]]; then
  echo "Database '$TARGET_DB' already exists. Updating passwords."

  PGPASSWORD="$POSTGRES_PASSWORD" psql -v ON_ERROR_STOP=1 -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d postgres <<EOF
ALTER ROLE events_migrator WITH PASSWORD '${EVENTS_MIGRATOR_POSTGRES_PASSWORD}';
ALTER ROLE events_app WITH PASSWORD '${EVENTS_APP_POSTGRES_PASSWORD}';
EOF

  echo "Passwords updated. Skipping initialization."
  exit 0
fi

echo "Database '$TARGET_DB' does not exist. Initializing..."

echo "[1/2] Cluster-wide setup..."
PGPASSWORD="$POSTGRES_PASSWORD" psql -v ON_ERROR_STOP=1 -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" -d postgres <<EOF || { echo "❌ Cluster-wide SQL failed"; exit 1; }
CREATE DATABASE "$TARGET_DB";

CREATE ROLE events_migrator WITH LOGIN PASSWORD '${EVENTS_MIGRATOR_POSTGRES_PASSWORD}';
CREATE ROLE events_app WITH LOGIN PASSWORD '${EVENTS_APP_POSTGRES_PASSWORD}';

GRANT CONNECT ON DATABASE "$TARGET_DB" TO events_migrator, events_app;
EOF

echo "[2/2] Database-specific setup..."
PGPASSWORD="$POSTGRES_PASSWORD" psql -v ON_ERROR_STOP=1 -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" -d "$TARGET_DB" <<EOF || { echo "❌ DB-specific SQL failed"; exit 1; }
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM events_migrator;

CREATE SCHEMA app AUTHORIZATION events_migrator;
GRANT USAGE ON SCHEMA app TO events_app;
EOF

echo "✅ Database '$TARGET_DB' initialized successfully."
exit 0
