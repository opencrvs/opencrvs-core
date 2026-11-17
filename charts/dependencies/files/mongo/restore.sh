#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

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

# Install required software to transfer backup on remote host
rm /etc/apt/sources.list.d/mongodb-org.list
apt-get update
apt-get install -y openssh-client rsync

if [ -z "$ENCRYPT_PASS" ]; then
  echo "[$(date +%F\ %H:%M:%S)] [ERROR] Must provide ENCRYPT_PASS environment variable"
  exit 1
fi

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

decrypt_backup() {
  echo "[$(date +%F\ %H:%M:%S)] Decrypting backup file"
  openssl enc -d -aes-256-cbc -pbkdf2 -salt -in "${ARCHIVE_PATH}.enc" -out "$ARCHIVE_PATH" -pass env:ENCRYPT_PASS
  echo "[$(date +%F\ %H:%M:%S)] Decrypted archive at $ARCHIVE_PATH"
}
extract_backup(){
  mkdir -p "$WORK_PATH"
  tar -zxvf "$ARCHIVE_PATH" -C "$WORK_PATH"
  echo "[$(date +%F\ %H:%M:%S)] Archive $ARCHIVE_PATH extracted into $WORK_PATH"
  ls -hl $WORK_PATH
}

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

transfer_from_backup_host

decrypt_backup

extract_backup

/scripts/cleanup.sh

restore_databases