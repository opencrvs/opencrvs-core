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
OPENHIM_CONFIG=./build/dist/src/migrate-mongo-config-openhim.js
APP_CONFIG=./build/dist/src/migrate-mongo-config-application-config.js
USER_MGNT_CONFIG=./build/dist/src/migrate-mongo-config-user-mgnt.js
PERFORMANCE_CONFIG=./build/dist/src/migrate-mongo-config-performance.js

SCRIPT_PATH=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

export NODE_OPTIONS=--dns-result-order=ipv4first

# hearth migrations
yarn --cwd $SCRIPT_PATH migrate-mongo up --file $HEARTH_CONFIG
yarn --cwd $SCRIPT_PATH migrate-mongo status --file $HEARTH_CONFIG

# events migrations
export EVENTS_DB_USER="${EVENTS_DB_USER:-events_app}"
MIGRATIONS_PATH=$SCRIPT_PATH/src/migrations/events
BACKUP_PATH=$MIGRATIONS_PATH/backup

mkdir -p $BACKUP_PATH

FILES_TO_MIGRATE=$(ls -p $MIGRATIONS_PATH | grep -v /)

for migration_file in $FILES_TO_MIGRATE
do
  echo "Creating backup for $MIGRATIONS_PATH/$migration_file"
  cp $MIGRATIONS_PATH/$migration_file $BACKUP_PATH/$migration_file
done

for migration_file in $FILES_TO_MIGRATE
do
  echo "Updating environment variables in $MIGRATIONS_PATH/$migration_file"
  envsubst < $MIGRATIONS_PATH/$migration_file > $MIGRATIONS_PATH/$migration_file.tmp
  mv $MIGRATIONS_PATH/$migration_file.tmp $MIGRATIONS_PATH/$migration_file
done

DATABASE_URL=${EVENTS_POSTGRES_URL} yarn --cwd $SCRIPT_PATH node-pg-migrate up --schema=app --migrations-dir=./src/migrations/events

for migration_file in $FILES_TO_MIGRATE
do
  echo "Reverting original file $MIGRATIONS_PATH/$migration_file"
  mv $BACKUP_PATH/$migration_file $MIGRATIONS_PATH/$migration_file
done

rm -rf $BACKUP_PATH

#openhim migrations
yarn --cwd $SCRIPT_PATH migrate-mongo up --file $OPENHIM_CONFIG
yarn --cwd $SCRIPT_PATH migrate-mongo status --file $OPENHIM_CONFIG

# Application Config migration
yarn --cwd $SCRIPT_PATH migrate-mongo up --file $APP_CONFIG
yarn --cwd $SCRIPT_PATH migrate-mongo status --file $APP_CONFIG

# User mgnt migration
yarn --cwd $SCRIPT_PATH migrate-mongo up --file $USER_MGNT_CONFIG
yarn --cwd $SCRIPT_PATH migrate-mongo status --file $USER_MGNT_CONFIG

# performance migration
yarn --cwd $SCRIPT_PATH migrate-mongo up --file $PERFORMANCE_CONFIG
yarn --cwd $SCRIPT_PATH migrate-mongo status --file $PERFORMANCE_CONFIG

# search migration / reindex
yarn --cwd $SCRIPT_PATH reindex-search
