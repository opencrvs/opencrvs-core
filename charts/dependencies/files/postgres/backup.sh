#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

. "$(dirname "${BASH_SOURCE[0]}")/ensure-utilities.sh"
. /scripts/backup-functions.sh

# Databases backup list, space (" ") separated list, only events database needs to be backed up
DATABASES=${DATABASES:-"events"}
# Initial variables configuration
# Today's date is used for filenames if LABEL is not provided
BACKUP_DATE=$(date +%Y-%m-%d)
# Local directory inside container
BACKUP_DIR="/backups"
# Remote directory on backup server
REMOTE_DIR="${BACKUP_REMOTE_DIR:-"/home/$BACKUP_USER"}/$BACKUP_DATE"
# Temporal archive path inside container
ARCHIVE_PATH="/tmp/postgres_backup_${BACKUP_DATE}.tar.gz"

mkdir -p $BACKUP_DIR

ensure_utilities "openssh-client rsync" ssh rsync || exit 1

if [ -z "$ENCRYPT_PASS" ]; then
  echo "[$(date +%F\ %H:%M:%S)] [ERROR] Must provide ENCRYPT_PASS environment variable"
  exit 1
fi

backup(){
  for DB in $DATABASES; do
    echo "[$(date +%F\ %H:%M:%S)] Backing up PostgreSQL '$DB' database"
    pg_dump -v -h $POSTGRES_HOST -U $POSTGRES_USER -d $DB -F c -f $BACKUP_DIR/${DB}.dump
    echo "[$(date +%F\ %H:%M:%S)] Backups completed: $BACKUP_DIR/${DB}.dump"
  done
  # Dump roles without passwords
  echo "[$(date +%F\ %H:%M:%S)] Backup database roles"
  pg_dumpall -h $POSTGRES_HOST -U $POSTGRES_USER --roles-only | grep -v "ALTER ROLE.*PASSWORD" > $BACKUP_DIR/roles.sql
}

backup
create_archive "$BACKUP_DIR" "$ARCHIVE_PATH" || exit 1
encrypt_backup "$ARCHIVE_PATH" "${ARCHIVE_PATH}.enc" || exit 1
transfer_to_backup_host "${ARCHIVE_PATH}.enc" "$REMOTE_DIR" "$BACKUP_USER" "$BACKUP_HOST" || exit 1
