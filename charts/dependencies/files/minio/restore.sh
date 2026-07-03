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

. /scripts/backup-functions.sh
. /scripts/ensure-utilities.sh

ensure_utilities || exit 1


# Initial configuration
RESTORE_DATE=${RESTORE_DATE:-$(date -d "yesterday" +%Y-%m-%d)}
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

validate_restore_contents() {
  shopt -s nullglob
  local bucket_dirs=("$WORK_PATH"/*)
  shopt -u nullglob

  if [ "${#bucket_dirs[@]}" -eq 0 ]; then
    echo "[$(date +%F\ %H:%M:%S)] [ERROR] Extracted MinIO backup is empty" >&2
    return 1
  fi
}

# Restore using MinIO mirror (bucket by bucket)
restore_mirror() {
  MINIO_ALIAS=local-restore
  mcli alias set "$MINIO_ALIAS" http://minio:3535 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"

  # Restore each bucket
  for bucket_dir in "$WORK_PATH"/*; do
    bucket=$(basename "$bucket_dir")
    echo "[$(date +%F\ %H:%M:%S)] Restoring bucket: $bucket"
    # Make sure bucket exists
    mcli mb --ignore-existing "$MINIO_ALIAS/$bucket"
    # Mirror bucket data back
    mcli mirror --overwrite "$bucket_dir" "$MINIO_ALIAS/$bucket"
  done

  echo "[$(date +%F\ %H:%M:%S)] MinIO mirror restore complete"
}

transfer_from_backup_host "$REMOTE_DIR/${ARCHIVE_NAME}.enc" "${ARCHIVE_PATH}.enc" "$BACKUP_USER" "$BACKUP_HOST"
decrypt_backup "${ARCHIVE_PATH}.enc" "$ARCHIVE_PATH"
extract_archive "$ARCHIVE_PATH" "$WORK_PATH"
validate_restore_contents
/scripts/cleanup.sh
restore_mirror

echo "[$(date +%F\ %H:%M:%S)] MinIO restore process completed successfully"
