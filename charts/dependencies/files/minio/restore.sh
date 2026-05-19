#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors

set -e
# Install necessary tools (if running in an Alpine-based container)
apk add --no-cache bash curl openssl openssh jq rsync minio-client coreutils


# Initial configuration
RESTORE_DATE=${RESTORE_DATE:-$(date -d "yesterday" +%Y-%m-%d)}
# Mount directory to restore into (typically /data)
RESTORE_DIR="/data"
# Temporary work directory
WORK_PATH="/tmp/minio-restore"
mkdir -p "$WORK_PATH"
# Path for decrypted archive
ARCHIVE_NAME="minio_backup_${RESTORE_DATE}.tar.gz"
ARCHIVE_PATH="/tmp/$ARCHIVE_NAME"

# Remote directory on backup server
REMOTE_DIR="${BACKUP_REMOTE_DIR:-"/home/$BACKUP_USER"}/$RESTORE_DATE"

if [ -z "$ENCRYPT_PASS" ]; then
  echo "[$(date +%F\ %H:%M:%S)] [ERROR] Must provide ENCRYPT_PASS environment variable"
  exit 1
fi

echo "[$(date +%F\ %H:%M:%S)] Starting MinIO restore operation"

# Decrypt backup
decrypt_backup() {
  echo "[$(date +%F\ %H:%M:%S)] Decrypting backup file"
  openssl enc -d -aes-256-cbc -pbkdf2 -salt -in "${ARCHIVE_PATH}.enc" -out "$ARCHIVE_PATH" -pass env:ENCRYPT_PASS
  echo "[$(date +%F\ %H:%M:%S)] Decrypted archive at $ARCHIVE_PATH"
}

# Restore using MinIO mirror (bucket by bucket)
restore_mirror() {
  MINIO_ALIAS=local-restore
  mcli alias set $MINIO_ALIAS http://minio:3535 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

  echo "[$(date +%F\ %H:%M:%S)] Extracting archive to $WORK_PATH"
  mkdir -p "$WORK_PATH"
  tar -zxvf "$ARCHIVE_PATH" -C "$WORK_PATH"

  # Restore each bucket
  for bucket_dir in "$WORK_PATH"/*; do
    bucket=$(basename "$bucket_dir")
    echo "[$(date +%F\ %H:%M:%S)] Restoring bucket: $bucket"
    # Make sure bucket exists
    mcli mb --ignore-existing $MINIO_ALIAS/"$bucket"
    # Mirror bucket data back
    mcli mirror --overwrite "$bucket_dir" $MINIO_ALIAS/"$bucket"
  done

  echo "[$(date +%F\ %H:%M:%S)] MinIO mirror restore complete"
}


transfer_from_backup_host(){
  echo "[$(date +%F\ %H:%M:%S)] Transfer backup from remote host"
if rsync -avz \
  -e "ssh -i /ssh/ssh_key -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
  "${BACKUP_USER}@${BACKUP_HOST}:${REMOTE_DIR}/${ARCHIVE_NAME}.enc" "${ARCHIVE_PATH}.enc"; then
  echo "[$(date +%F\ %H:%M:%S)] Encrypted backup file ${ARCHIVE_PATH}.enc transferred from backup host ${BACKUP_HOST}:${REMOTE_DIR}"
else
  echo "[$(date +%F\ %H:%M:%S)] [ERROR] Failed to transfer file ${ARCHIVE_PATH}.enc from backup host ${BACKUP_HOST}:${REMOTE_DIR}" >&2
  exit 1
fi
  
}

# Cleanup minio before restore
/scripts/cleanup.sh

transfer_from_backup_host

decrypt_backup

restore_mirror

echo "[$(date +%F\ %H:%M:%S)] MinIO restore process completed successfully"
