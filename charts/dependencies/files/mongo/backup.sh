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

# Databases backup list
DATABASES=${DATABASES:-"hearth-dev events user-mgnt metrics performance"}
# Initial variables configuration
# Today's date is used for filenames if LABEL is not provided
BACKUP_DATE=$(date +%Y-%m-%d)
# Local directory inside container
BACKUP_DIR="/backups"
# Remote directory on backup server
REMOTE_DIR="${BACKUP_REMOTE_DIR:-"/home/$BACKUP_USER"}/$BACKUP_DATE"
# Temporal archive path inside container
ARCHIVE_PATH="/tmp/mongo_backup_${BACKUP_DATE}.tar.gz"
echo "[$(date +%F\ %H:%M:%S)] Starting MongoDB backup script"

mkdir -p $BACKUP_DIR

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

backup(){
  for DB in $DATABASES; do
    echo "[$(date +%F\ %H:%M:%S)] Running backup for DB $DB"
    if [ -n "${MONGODB_ADMIN_USER:-}" ] && [ -n "${MONGODB_ADMIN_PASSWORD:-}" ]; then
      mongodump --host $MONGODB_HOST \
        --username "$MONGODB_ADMIN_USER" \
        --password "$MONGODB_ADMIN_PASSWORD" \
        --authenticationDatabase admin \
        --gzip --archive=$BACKUP_DIR/$DB.gz \
        -d $DB
    else
      mongodump --host $MONGODB_HOST \
        --authenticationDatabase admin \
        --gzip --archive=$BACKUP_DIR/$DB.gz \
        -d $DB
    fi
  done
  echo "[$(date +%F\ %H:%M:%S)] Backups completed: $BACKUP_DIR/*.gz"
}

backup
create_archive "$BACKUP_DIR" "$ARCHIVE_PATH" || exit 1
encrypt_backup "$ARCHIVE_PATH" "${ARCHIVE_PATH}.enc" || exit 1
transfer_to_backup_host "${ARCHIVE_PATH}.enc" "$REMOTE_DIR" "$BACKUP_USER" "$BACKUP_HOST" || exit 1
