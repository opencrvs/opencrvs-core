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

MIGRATE_LEGACRY_USERS=false

for arg in "$@"; do
  case $arg in
  --migrate-legacy-users)
    MIGRATE_LEGACRY_USERS=true
    ;;
  *)
    # Handle unknown option
    echo "Unknown option: $arg"
    exit 1
    ;;
  esac
done

# hearth migrations
yarn --cwd $SCRIPT_PATH migrate-mongo up --file $HEARTH_CONFIG

run_pg_migrations() {
  MIGRATIONS_PATH="$1"
  local database_url="$2"
  local schema="$3"
  local migrations_table="${4:-pgmigrations}"

  BACKUP_PATH="$MIGRATIONS_PATH/backup"

  mkdir -p "$BACKUP_PATH"

  FILES_TO_MIGRATE=$(ls -p "$MIGRATIONS_PATH" | grep -v /)

  # --- define cleanup function ---
  # As this function is being called via 'trap', the variables
  # used inside need to be global
  restore_backups() {
    echo "Restoring original migration files in $MIGRATIONS_PATH"
    for migration_file in $FILES_TO_MIGRATE; do
      if [ -f "$BACKUP_PATH/$migration_file" ]; then
        mv "$BACKUP_PATH/$migration_file" "$MIGRATIONS_PATH/$migration_file"
      fi
    done
    rm -rf "$BACKUP_PATH"
  }

  # Always run restore_backups when the function exits
  trap restore_backups EXIT

  # --- Backup originals ---
  for migration_file in $FILES_TO_MIGRATE; do
    echo "Creating backup for $MIGRATIONS_PATH/$migration_file"
    cp "$MIGRATIONS_PATH/$migration_file" "$BACKUP_PATH/$migration_file"
  done

  # --- envsubst ---
  for migration_file in $FILES_TO_MIGRATE; do
    echo "Updating environment variables in $MIGRATIONS_PATH/$migration_file"
    envsubst <"$MIGRATIONS_PATH/$migration_file" >"$MIGRATIONS_PATH/$migration_file.tmp"
    mv "$MIGRATIONS_PATH/$migration_file.tmp" "$MIGRATIONS_PATH/$migration_file"
  done

  # --- Run migrations ---
  echo "Running migrations for schema '$schema' in $MIGRATIONS_PATH"
  DATABASE_URL="$database_url" \
    yarn --cwd "$SCRIPT_PATH" node-pg-migrate up \
    --schema="$schema" \
    --migrations-dir="$MIGRATIONS_PATH" \
    --migrations-table="$migrations_table"

  # If migration succeeds, remove trap before exit so cleanup still happens normally
  trap - EXIT
  restore_backups
}

# Run superuser events migrations
if [ $MIGRATE_LEGACRY_USERS = true ]; then
  export EVENTS_MIGRATION_USER="${EVENTS_MIGRATION_USER:-events_migrator}"

  if [ -n "$MONGO_REPLICA_SET" ]; then
    export MONGO_SERVER_OPTIONS="OPTIONS( address '${MONGO_HOST:-mongo1}', port '${MONGO_PORT:-27017}', replica_set '$MONGO_REPLICA_SET', authentication_database 'admin')"
  else
    export MONGO_SERVER_OPTIONS="OPTIONS( address '${MONGO_HOST:-mongo1}', port '${MONGO_PORT:-27017}', authentication_database 'admin')"
  fi

  if [ -n "$MONGO_USERNAME" ] && [ -n "$MONGO_PASSWORD" ]; then
    export MONGO_USER_MAPPING_OPTIONS="OPTIONS( username '$MONGO_USERNAME', password '$MONGO_PASSWORD')"
  fi

  run_pg_migrations \
    "$SCRIPT_PATH/src/migrations/migrate-legacy-users" \
    "$EVENTS_SUPERUSER_POSTGRES_URL" \
    "app" \
    "pgmigrations_legacy_users"

fi

# Run events migrations
export EVENTS_DB_USER="${EVENTS_DB_USER:-events_app}"

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
