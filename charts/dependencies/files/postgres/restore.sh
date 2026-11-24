#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

. "$(dirname "${BASH_SOURCE[0]}")/ensure-deb-utils.sh"
. /scripts/backup-functions.sh
# Databases backup list, space (" ") separated list, only events database needs to be backed up
DATABASES=${DATABASES:-"events"}

# Initial configuration
RESTORE_DATE=${RESTORE_DATE:-$(date -d "yesterday" +%Y-%m-%d)}
WORK_PATH=/tmp/backup
# Remote directory on backup server
REMOTE_DIR="${BACKUP_REMOTE_DIR:-"/home/$BACKUP_USER"}/$RESTORE_DATE"
# Temporal archive path inside container
ARCHIVE_NAME="postgres_backup_${RESTORE_DATE}.tar.gz"
ARCHIVE_PATH="/tmp/$ARCHIVE_NAME"

ensure_deb_utils "openssh-client rsync" ssh rsync || exit 1

if [ -z "$ENCRYPT_PASS" ]; then
  echo "[$(date +%F\ %H:%M:%S)] [ERROR] Must provide ENCRYPT_PASS environment variable"
  exit 1
fi

validate_restore_contents() {
  if [ ! -f "$WORK_PATH/roles.sql" ]; then
    echo "[$(date +%F\ %H:%M:%S)] [ERROR] Missing roles.sql in extracted backup" >&2
    return 1
  fi

  for DB in $DATABASES; do
    if [ ! -f "$WORK_PATH/$DB.dump" ]; then
      echo "[$(date +%F\ %H:%M:%S)] [ERROR] Missing database archive: $WORK_PATH/$DB.dump" >&2
      return 1
    fi
  done
}

restore_databases(){
  echo "Restore roles"
  psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -f "$WORK_PATH/roles.sql"
  echo "[$(date +%F\ %H:%M:%S)] Running restore databases"
  for DB in $DATABASES; do
    DB_ARCHIVE_PATH="$WORK_PATH/$DB.dump"
    if [ -f "$DB_ARCHIVE_PATH" ]; then
      echo "[$(date +%F\ %H:%M:%S)] Restoring database: $DB"
      pg_restore -v -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$DB" -F c "$DB_ARCHIVE_PATH"
    else
      echo "[$(date +%F\ %H:%M:%S)] [WARN] Archive for $DB not found: $DB_ARCHIVE_PATH" >&2
    fi
  done
}
echo "[$(date +%F\ %H:%M:%S)] Running restore"

transfer_from_backup_host "$REMOTE_DIR/${ARCHIVE_NAME}.enc" "${ARCHIVE_PATH}.enc" "$BACKUP_USER" "$BACKUP_HOST" || exit 1
decrypt_backup "${ARCHIVE_PATH}.enc" "$ARCHIVE_PATH" || exit 1
extract_archive "$ARCHIVE_PATH" "$WORK_PATH" || exit 1
validate_restore_contents || exit 1
/scripts/cleanup.sh
restore_databases
