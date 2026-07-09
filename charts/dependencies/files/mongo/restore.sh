#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

. /scripts/backup-functions.sh

echo "Running restore"
DATABASES=${DATABASES:-"hearth-dev events user-mgnt metrics performance"}

# Initial configuration
RESTORE_DATE=${RESTORE_DATE:-$(date -d "yesterday" +%Y-%m-%d)}
WORK_PATH=/tmp/backup
# Remote directory on backup server
REMOTE_DIR="${BACKUP_REMOTE_DIR:-"/home/$BACKUP_USER"}/$RESTORE_DATE"
# Temporal archive path inside container
ARCHIVE_NAME="mongo_backup_${RESTORE_DATE}.tar.gz"
ARCHIVE_PATH="/tmp/$ARCHIVE_NAME"

# Install required tools only when the image does not already provide them.
missing=""
for utility in ssh rsync; do
  command -v "$utility" >/dev/null 2>&1 || missing="$missing $utility"
done
if [ -n "$missing" ]; then
  rm -f /etc/apt/sources.list.d/mongodb-org.list
  if ! apt-get update || ! apt-get install -y openssh-client rsync; then
    echo "[ERROR] Missing utilities:$missing" >&2
    echo "[ERROR] Automatic installation failed. Ensure the container can access its package repositories, or include the required packages in the base image for air-gapped deployments." >&2
    exit 1
  fi
fi

if [ -z "$ENCRYPT_PASS" ]; then
  echo "[$(date +%F\ %H:%M:%S)] [ERROR] Must provide ENCRYPT_PASS environment variable"
  exit 1
fi

restore_databases() {
  echo "[$(date +%F\ %H:%M:%S)] Running restore databases"
  for DB in $DATABASES; do
    DB_ARCHIVE_PATH="$WORK_PATH/$DB.gz"
    if [ -f "$DB_ARCHIVE_PATH" ]; then
      echo "[$(date +%F\ %H:%M:%S)] Restoring database: $DB"
      if [ -n "${MONGODB_ADMIN_USER:-}" ] && [ -n "${MONGODB_ADMIN_PASSWORD:-}" ]; then
        mongorestore --host "$MONGODB_HOST" \
          --username "$MONGODB_ADMIN_USER" \
          --password "$MONGODB_ADMIN_PASSWORD" \
          --authenticationDatabase admin \
          --gzip --archive="$DB_ARCHIVE_PATH" --nsInclude "$DB.*" --drop
      else
        mongorestore --host "$MONGODB_HOST" \
          --gzip --archive="$DB_ARCHIVE_PATH" --nsInclude "$DB.*" --drop
      fi
    else
      echo "[$(date +%F\ %H:%M:%S)] [WARN] Archive for $DB not found: $DB_ARCHIVE_PATH" >&2
    fi
  done
}


echo "[$(date +%F\ %H:%M:%S)] Running restore"

transfer_from_backup_host "$REMOTE_DIR/${ARCHIVE_NAME}.enc" "${ARCHIVE_PATH}.enc" "$BACKUP_USER" "$BACKUP_HOST" || exit 1
decrypt_backup "${ARCHIVE_PATH}.enc" "$ARCHIVE_PATH" || exit 1
extract_archive "$ARCHIVE_PATH" "$WORK_PATH" || exit 1
/scripts/cleanup.sh
restore_databases
