#!/bin/bash
set -euo pipefail

# Configuration
: "${POSTGRES_HOST:=localhost}"
: "${POSTGRES_PORT:=5432}"
: "${POSTGRES_PASSWORD:?Must set POSTGRES_PASSWORD}"
: "${POSTGRES_USER:?Must set POSTGRES_USER}"
: "${ANALYTICS_POSTGRES_USER:?Must set ANALYTICS_POSTGRES_USER}"
: "${REFERENCE_DATA_POSTGRES_PASSWORD:?Must set REFERENCE_DATA_POSTGRES_PASSWORD}"
: "${REFERENCE_DATA_POSTGRES_USER:?Must set REFERENCE_DATA_POSTGRES_USER}"
: "${REFERENCE_DATA_EDITOR_PASSWORD:?Must set REFERENCE_DATA_EDITOR_PASSWORD}"
: "${REFERENCE_DATA_EDITOR_USER:?Must set REFERENCE_DATA_EDITOR_USER}"
: "${KEEP_ALIVE_SECONDS:=0}" # Prevent Swarm from marking this task as failed due to early exit

TARGET_DB=${TARGET_DB:-"events"}

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

create_or_update_role "$REFERENCE_DATA_POSTGRES_USER" "$REFERENCE_DATA_POSTGRES_PASSWORD" "$TARGET_DB"
create_or_update_role "$REFERENCE_DATA_EDITOR_USER" "$REFERENCE_DATA_EDITOR_PASSWORD" "$TARGET_DB"

echo "Initializing reference-data schema..."

# Schema + tables + grants
PGPASSWORD="$POSTGRES_PASSWORD" psql -v ON_ERROR_STOP=1 -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" -d "$TARGET_DB" <<EOSQL

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS reference_data;

CREATE TABLE IF NOT EXISTS reference_data.icd10 (
  id text PRIMARY KEY,
  label text NOT NULL,
  code text NOT NULL,
  uc_label text NOT NULL,
  chapter_no text NOT NULL,
  chapter_range text NOT NULL,
  chapter_name text NOT NULL,
  subchapter_code text NOT NULL,
  subchapter_name text NOT NULL,
  ncd_cd_injuries text,
  ill_defined text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  valid_until timestamp with time zone
);

ALTER TABLE reference_data.icd10 ADD COLUMN IF NOT EXISTS uc_label text NOT NULL DEFAULT '';

GRANT USAGE ON SCHEMA reference_data TO ${REFERENCE_DATA_EDITOR_USER};

GRANT SELECT, INSERT, UPDATE ON TABLE reference_data.icd10 TO ${REFERENCE_DATA_EDITOR_USER};

-- Required for fuzzy search performance
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Fast prefix & exact matches on code
CREATE INDEX IF NOT EXISTS icd10_code_idx
ON reference_data.icd10 (code);

-- Fast fuzzy search on label
CREATE INDEX IF NOT EXISTS icd10_label_trgm_idx
ON reference_data.icd10
USING gin (label gin_trgm_ops);

GRANT USAGE ON SCHEMA reference_data TO ${REFERENCE_DATA_POSTGRES_USER};
GRANT USAGE ON SCHEMA reference_data TO ${ANALYTICS_POSTGRES_USER};

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA reference_data TO ${REFERENCE_DATA_POSTGRES_USER};
GRANT SELECT ON ALL TABLES IN SCHEMA reference_data TO ${ANALYTICS_POSTGRES_USER};

EOSQL


echo "✅ reference-data schema and icd10 table initialized"
