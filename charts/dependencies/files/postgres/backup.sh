#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.


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
# Remote directory on backup server
REMOTE_DIR="${BACKUP_REMOTE_DIR:-"/home/$BACKUP_USER"}/$BACKUP_DATE"

mkdir -p $BACKUP_DIR

# Install required software to transfer backup on remote host
apt-get update
apt-get install -y openssh-client rsync

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

create_encrypted_backup(){
  echo "[$(date +%F\ %H:%M:%S)] Archive and Encrypt backup at $ARCHIVE_PATH"
  # Tar/gzip all snapshot content
  tar cvzf "$ARCHIVE_PATH" -C "$BACKUP_DIR" .

  # Encrypt
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

backup
create_encrypted_backup
transfer_to_backup_host