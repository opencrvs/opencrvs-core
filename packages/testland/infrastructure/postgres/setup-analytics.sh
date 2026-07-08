#!/bin/bash
set -euo pipefail

# NOTE!
# This setup is ran before core migrations. Therefore you CAN NOT refer to the tables or data in core.

# Configuration
: "${POSTGRES_HOST:=localhost}"
: "${POSTGRES_PORT:=5432}"
: "${POSTGRES_PASSWORD:?Must set POSTGRES_PASSWORD}"
: "${POSTGRES_USER:?Must set POSTGRES_USER}"
: "${ANALYTICS_POSTGRES_PASSWORD:?Must set ANALYTICS_POSTGRES_PASSWORD}"
: "${ANALYTICS_POSTGRES_USER:?Must set ANALYTICS_POSTGRES_USER}"
: "${POSTGRES_PASSWORD:?Must set POSTGRES_PASSWORD}"
: "${KEEP_ALIVE_SECONDS:=0}" # Prevent Swarm from marking this task as failed due to early exit

TARGET_DB=${TARGET_DB-"events"}

export TARGET_DB=${TARGET_DB//-/_}

echo "Waiting for PostgreSQL to be ready at ${POSTGRES_HOST}:${POSTGRES_PORT}..."
until PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" -d postgres -c '\q' 2>/dev/null; do
  sleep 2
done

sleep "$KEEP_ALIVE_SECONDS"

create_or_update_role() {
  local role=$1
  local password=$2
  local db=$3

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

create_or_update_role "$ANALYTICS_POSTGRES_USER" "$ANALYTICS_POSTGRES_PASSWORD" "$TARGET_DB"

# Schema + tables + grants
PGPASSWORD="$POSTGRES_PASSWORD" psql -v ON_ERROR_STOP=1 -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" -d "$TARGET_DB" <<EOSQL

CREATE SCHEMA IF NOT EXISTS analytics;

CREATE TABLE IF NOT EXISTS analytics.administrative_areas (
  id TEXT PRIMARY KEY,
  name text NOT NULL,
  parent_id TEXT REFERENCES analytics.administrative_areas(id)
);

CREATE TABLE IF NOT EXISTS analytics.locations (
  id TEXT PRIMARY KEY,
  name text NOT NULL,
  administrative_area_id TEXT REFERENCES analytics.administrative_areas(id),
  location_type TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics.event_actions (
  event_type text NOT NULL,
  action_type TEXT NOT NULL,
  annotation jsonb,
  assigned_to text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at_location TEXT,
  created_by text NOT NULL,
  created_by_role text,
  created_by_signature text,
  created_by_user_type TEXT NOT NULL,
  declared_at timestamp with time zone,
  registered_at timestamp with time zone,
  declaration jsonb NOT NULL DEFAULT '{}'::jsonb,
  event_id uuid NOT NULL,
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  original_action_id uuid,
  registration_number text UNIQUE,
  request_id text,
  status TEXT NOT NULL,
  transaction_id text NOT NULL,
  content jsonb,
  UNIQUE (id, event_id)
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS analytics_idx_event_actions_event_id
ON analytics.event_actions (event_id);

ALTER TABLE analytics.event_actions ADD COLUMN IF NOT EXISTS custom_action_type TEXT;
ALTER TABLE analytics.event_actions ALTER COLUMN created_by_role DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_actions_event_id ON analytics.event_actions (event_id);

CREATE TABLE IF NOT EXISTS analytics.location_levels (
  id text PRIMARY KEY,
  level int NOT NULL,
  name text NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics.location_statistics (
  name text,
  reference_id text NOT NULL,
  year int NOT NULL,
  crude_birth_rate NUMERIC(4,1) NOT NULL,
  male_population int NOT NULL,
  female_population int NOT NULL,
  total_population int NOT NULL,
  UNIQUE (reference_id, year)
);

GRANT USAGE ON SCHEMA analytics TO "$ANALYTICS_POSTGRES_USER";

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA analytics TO "$ANALYTICS_POSTGRES_USER";
EOSQL

echo "✅ Analytics schema initialized for database '$TARGET_DB'"
