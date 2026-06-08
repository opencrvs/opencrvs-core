#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

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
# Remote directory on backup server
REMOTE_DIR="${BACKUP_REMOTE_DIR:-"/home/$BACKUP_USER"}/$BACKUP_DATE"
echo "[$(date +%F\ %H:%M:%S)] Starting MongoDB backup script"

mkdir -p $BACKUP_DIR

# Install required software to transfer backup on remote host
rm /etc/apt/sources.list.d/mongodb-org.list
apt-get update
apt-get install -y openssh-client rsync

if [ -z "$ENCRYPT_PASS" ]; then
  echo "[$(date +%F\ %H:%M:%S)] [ERROR] Must provide ENCRYPT_PASS environment variable"
  exit 1
fi

create_encrypted_backup(){
  echo "[$(date +%F\ %H:%M:%S)] Archive and Encrypt backup at $ARCHIVE_PATH"
  # Tar/gzip all snapshot content
  tar czf "$ARCHIVE_PATH" -C "$BACKUP_DIR" .

  # Encrypt
  openssl enc -aes-256-cbc -pbkdf2 -salt -in "$ARCHIVE_PATH" -out "${ARCHIVE_PATH}.enc" -pass env:ENCRYPT_PASS
  rm -f "$ARCHIVE_PATH"
  echo "[$(date +%F\ %H:%M:%S)] Backup encrypted at ${ARCHIVE_PATH}.enc"
}
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

restore_databases() {
  for DB in $DATABASES; do
    DB_DUMP_PATH="$WORK_PATH/$DB"
    if [ -d "$DB_DUMP_PATH" ]; then
      echo "[$(date +%F\ %H:%M:%S)] Restoring database: $DB"
      if [ -n "${MONGODB_ADMIN_USER:-}" ] && [ -n "${MONGODB_ADMIN_PASSWORD:-}" ]; then
        mongorestore --host "$MONGODB_HOST" --username "$MONGODB_ADMIN_USER" --password "$MONGODB_ADMIN_PASSWORD" \
          --authenticationDatabase admin --db "$DB" --drop "$DB_DUMP_PATH"
      else
        mongorestore --host "$MONGODB_HOST" --db "$DB" --drop "$DB_DUMP_PATH"
      fi
    else
      echo "[$(date +%F\ %H:%M:%S)] [WARN] Dump path for $DB not found: $DB_DUMP_PATH" >&2
    fi
  done
}




backup
create_encrypted_backup
transfer_to_backup_host