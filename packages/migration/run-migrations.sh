#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

set -e # fail if any of the commands fails

HEARTH_CONFIG=./build/dist/src/migrate-mongo-config-hearth.js
: "${EVENTS_POSTGRES_URL:=postgres://events_migrator:migrator_password@localhost:5432/events}"
: "${EVENTS_SUPERUSER_POSTGRES_URL:=postgres://postgres:postgres@localhost:5432/events}"
OPENHIM_CONFIG=./build/dist/src/migrate-mongo-config-openhim.js
APP_CONFIG=./build/dist/src/migrate-mongo-config-application-config.js
USER_MGNT_CONFIG=./build/dist/src/migrate-mongo-config-user-mgnt.js
PERFORMANCE_CONFIG=./build/dist/src/migrate-mongo-config-performance.js

SCRIPT_PATH=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

export NODE_OPTIONS=--dns-result-order=ipv4first

# hearth migrations
yarn --cwd $SCRIPT_PATH migrate-mongo up --file $HEARTH_CONFIG

run_pg_migrations() {
  local migrations_path="$1"
  local database_url="$2"
  local schema="$3"
  local migrations_table="${4:-pgmigrations}"

  local backup_path="$migrations_path/backup"

  mkdir -p "$backup_path"

  local files_to_migrate=$(ls -p "$migrations_path" | grep -v /)

  # --- define cleanup function ---
  restore_backups() {
    echo "Restoring original migration files in $migrations_path"
    for migration_file in $files_to_migrate; do
      if [ -f "$backup_path/$migration_file" ]; then
        mv "$backup_path/$migration_file" "$migrations_path/$migration_file"
      fi
    done
    rm -rf "$backup_path"
  }

  # Always run restore_backups when the function exits
  trap restore_backups EXIT

  # --- Backup originals ---
  for migration_file in $files_to_migrate; do
    echo "Creating backup for $migrations_path/$migration_file"
    cp "$migrations_path/$migration_file" "$backup_path/$migration_file"
  done

  # --- envsubst ---
  for migration_file in $files_to_migrate; do
    echo "Updating environment variables in $migrations_path/$migration_file"
    envsubst <"$migrations_path/$migration_file" >"$migrations_path/$migration_file.tmp"
    mv "$migrations_path/$migration_file.tmp" "$migrations_path/$migration_file"
  done

  # --- Run migrations ---
  echo "Running migrations for schema '$schema' in $migrations_path"
  DATABASE_URL="$database_url" \
    yarn --cwd "$SCRIPT_PATH" node-pg-migrate up \
    --schema="$schema" \
    --migrations-dir="$migrations_path" \
    --migrations-table="$migrations_table"

  # If migration succeeds, remove trap before exit so cleanup still happens normally
  trap - EXIT
  restore_backups
}

export EVENTS_DB_USER="${EVENTS_DB_USER:-events_app}"
export EVENTS_MIGRATION_USER="${EVENTS_MIGRATION_USER:-events_migrator}"
export MONGO_HOST="${MONGO_HOST:-mongo1}"
export MONGO_PORT="${MONGO_PORT:-27017}"

# Run superuser events migrations
run_pg_migrations \
  "$SCRIPT_PATH/src/migrations/events-superuser" \
  "$EVENTS_SUPERUSER_POSTGRES_URL" \
  "app" \
  "pgmigrations_superuser"

# Run events migrations
run_pg_migrations \
  "$SCRIPT_PATH/src/migrations/events" \
  "$EVENTS_POSTGRES_URL" \
  "app"

#openhim migrations
yarn --cwd $SCRIPT_PATH migrate-mongo up --file $OPENHIM_CONFIG

# Application Config migration
yarn --cwd $SCRIPT_PATH migrate-mongo up --file $APP_CONFIG

# User mgnt migration
yarn --cwd $SCRIPT_PATH migrate-mongo up --file $USER_MGNT_CONFIG

# performance migration
yarn --cwd $SCRIPT_PATH migrate-mongo up --file $PERFORMANCE_CONFIG
