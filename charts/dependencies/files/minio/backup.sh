#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

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

# Install required tools
apk add --no-cache bash curl openssl openssh jq rsync minio-client

# Check backup encryption password
if [ -z "$ENCRYPT_PASS" ]; then
  echo "[$(date +%F\ %H:%M:%S)] [ERROR] Must provide ENCRYPT_PASS environment variable"
  exit 1
fi

# Mirror data before backup
backup_and_archive(){
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
  cd $BACKUP_PATH && tar -zcvf $ARCHIVE_PATH .
}

create_encrypted_backup(){
  echo "[$(date +%F\ %H:%M:%S)] Encrypt backup at $ARCHIVE_PATH"
  openssl enc -aes-256-cbc -pbkdf2 -salt -in "$ARCHIVE_PATH" -out "${ARCHIVE_PATH}.enc" -pass env:ENCRYPT_PASS
  rm -f "$ARCHIVE_PATH"
  echo "[$(date +%F\ %H:%M:%S)] Backup encrypted at ${ARCHIVE_PATH}.enc"
}

transfer_to_backup_host(){
  echo "[$(date +%F\ %H:%M:%S)] Transfer backup to remote host"
if rsync -avz \
  --rsync-path="mkdir -p $REMOTE_DIR && rsync" \
  -e "ssh -i /ssh/ssh_key -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
  "${ARCHIVE_PATH}.enc" "${BACKUP_USER}@${BACKUP_HOST}:${REMOTE_DIR}/"; then
  echo "[$(date +%F\ %H:%M:%S)] Encrypted backup file ${ARCHIVE_PATH}.enc transferred to backup host ${BACKUP_HOST}:${REMOTE_DIR}"
else
  echo "[$(date +%F\ %H:%M:%S)] [ERROR] Failed to transfer file ${ARCHIVE_PATH}.enc to backup host ${BACKUP_HOST}:${REMOTE_DIR}" >&2
  exit 1
fi
  
}

echo "[$(date +%F\ %H:%M:%S)] Running backup container"

echo "[$(date +%F\ %H:%M:%S)] Setup connection to container http://minio:3535"


backup_and_archive

create_encrypted_backup

transfer_to_backup_host
