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
. /scripts/ensure-alpine-utils.sh

# Initial variables configuration
# Today's date is used for filenames if LABEL is not provided
BACKUP_DATE=$(date +%Y-%m-%d)
# Local directory inside container where minio data is mounted
BACKUP_DIR="/data"
# Temporal directory inside container to store data
BACKUP_PATH=/tmp/minio-backup
mkdir -p $BACKUP_PATH
# Temporal archive path inside container
ARCHIVE_PATH="/tmp/minio_backup_${BACKUP_DATE}.tar.gz"
# Remote directory on backup server
REMOTE_DIR="${BACKUP_REMOTE_DIR:-"/home/$BACKUP_USER"}/$BACKUP_DATE"
# Number of retries for backup creation
MAX_RETRIES=10

ensure_alpine_utils || exit 1

# Check backup encryption password
if [ -z "$ENCRYPT_PASS" ]; then
  echo "[$(date +%F\ %H:%M:%S)] [ERROR] Must provide ENCRYPT_PASS environment variable"
  exit 1
fi

# Mirror data before backup
backup_buckets(){
  MINIO_ALIAS=local
  mcli alias set $MINIO_ALIAS http://minio:3535 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

  # Figure out buckets to back up
  if [ -z "$BUCKETS" ]; then
    # All buckets
    BUCKETS=$(mcli ls --json $MINIO_ALIAS | jq -r .key | sed 's:/$::')
  fi
  echo "Backing up MinIO buckets: $BUCKETS"
  echo "Destination: $BACKUP_PATH"
  for bucket in $BUCKETS; do
    echo "Backing up bucket: $bucket"
    mcli mirror --overwrite $MINIO_ALIAS/$bucket "$BACKUP_PATH/$bucket"
  done

  echo "Backup completed! Buckets saved at: $BACKUP_PATH"
}

echo "[$(date +%F\ %H:%M:%S)] Running backup container"

echo "[$(date +%F\ %H:%M:%S)] Setup connection to container http://minio:3535"


backup_buckets
create_archive "$BACKUP_PATH" "$ARCHIVE_PATH" || exit 1
encrypt_backup "$ARCHIVE_PATH" "${ARCHIVE_PATH}.enc" || exit 1
transfer_to_backup_host "${ARCHIVE_PATH}.enc" "$REMOTE_DIR" "$BACKUP_USER" "$BACKUP_HOST" || exit 1
