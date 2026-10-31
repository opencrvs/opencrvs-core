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
. /scripts/ensure-alpine-utils.sh

ensure_alpine_utils || exit 1

if [ -z "$S3_ENDPOINT" ]; then
  echo "[$(date +%F\ %H:%M:%S)] [ERROR] Must provide S3_ENDPOINT environment variable"
  exit 1
fi

# Initial configuration
RESTORE_DATE=${RESTORE_DATE:-$(date -d "yesterday" +%Y-%m-%d)}
# Temporary work directory
WORK_PATH="/tmp/s3-restore"
mkdir -p "$WORK_PATH"
# Path for decrypted archive
# The archive keeps the name it had when MinIO was the only store, see backup.sh
ARCHIVE_NAME="minio_backup_${RESTORE_DATE}.tar.gz"
ARCHIVE_PATH="/tmp/$ARCHIVE_NAME"

# Remote directory on backup server
REMOTE_DIR="${BACKUP_REMOTE_DIR:-"/home/$BACKUP_USER"}/$RESTORE_DATE"

if [ -z "$ENCRYPT_PASS" ]; then
  echo "[$(date +%F\ %H:%M:%S)] [ERROR] Must provide ENCRYPT_PASS environment variable"
  exit 1
fi

echo "[$(date +%F\ %H:%M:%S)] Starting S3 restore operation"

validate_restore_contents() {
  shopt -s nullglob
  local bucket_dirs=("$WORK_PATH"/*)
  shopt -u nullglob

  if [ "${#bucket_dirs[@]}" -eq 0 ]; then
    echo "[$(date +%F\ %H:%M:%S)] [ERROR] Extracted S3 backup is empty" >&2
    return 1
  fi
}

# Restore using mcli mirror (bucket by bucket)
restore_mirror() {
  S3_ALIAS=local-restore
  mcli alias set "$S3_ALIAS" "$S3_ENDPOINT" "$S3_ADMIN_ACCESS_KEY" "$S3_ADMIN_SECRET_KEY"

  # Restore each bucket
  for bucket_dir in "$WORK_PATH"/*; do
    bucket=$(basename "$bucket_dir")
    echo "[$(date +%F\ %H:%M:%S)] Restoring bucket: $bucket"
    # Make sure bucket exists
    mcli mb --ignore-existing "$S3_ALIAS/$bucket"
    # Mirror bucket data back
    mcli mirror --overwrite "$bucket_dir" "$S3_ALIAS/$bucket"
  done

  echo "[$(date +%F\ %H:%M:%S)] S3 mirror restore complete"
}

transfer_from_backup_host "$REMOTE_DIR/${ARCHIVE_NAME}.enc" "${ARCHIVE_PATH}.enc" "$BACKUP_USER" "$BACKUP_HOST"
decrypt_backup "${ARCHIVE_PATH}.enc" "$ARCHIVE_PATH"
extract_archive "$ARCHIVE_PATH" "$WORK_PATH"
validate_restore_contents
/scripts/cleanup.sh
restore_mirror

echo "[$(date +%F\ %H:%M:%S)] S3 restore process completed successfully"
