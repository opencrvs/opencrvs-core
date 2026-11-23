#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

set -e

# Install required tools
apk add --no-cache bash curl openssl openssh jq rsync coreutils

ELASTIC_HOST=${ELASTIC_HOST:-"elasticsearch:9200"}
# Initial configuration
RESTORE_DATE=${RESTORE_DATE:-$(date -d "yesterday" +%Y-%m-%d)}
# Mount directory to restore into (typically /data)
BACKUP_DIR="/data/backups/elasticsearch"

# Path for decrypted archive
ARCHIVE_NAME="elasticsearch_backup_${RESTORE_DATE}.tar.gz"
ARCHIVE_PATH="/tmp/$ARCHIVE_NAME"

# Remote directory on backup server
REMOTE_DIR="${BACKUP_REMOTE_DIR:-"/home/$BACKUP_USER"}/$RESTORE_DATE"

SNAPSHOT_NAME=${SNAPSHOT_NAME:-"snapshot_${RESTORE_DATE}"}

# Check password for decryption
if [ -z "$ENCRYPT_PASS" ]; then
  echo "[$(date +%F\ %H:%M:%S)] [ERROR] Must provide ENCRYPT_PASS environment variable"
  exit 1
fi

# Hostname for elasticsearch container
# - password protected
# - no-password access
elasticsearch_host() {
  if [ ! -z ${ELASTIC_PASSWORD+x} ]; then
    echo "elastic:$ELASTIC_PASSWORD@${ELASTIC_HOST}"
  else
    echo "${ELASTIC_HOST}"
  fi
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

decrypt_backup() {
  echo "[$(date +%F\ %H:%M:%S)] Decrypting backup file"
  openssl enc -d -aes-256-cbc -pbkdf2 -salt -in "${ARCHIVE_PATH}.enc" -out "$ARCHIVE_PATH" -pass env:ENCRYPT_PASS
  echo "[$(date +%F\ %H:%M:%S)] Decrypted archive at $ARCHIVE_PATH"
}

# Extract .tar.gz
extract_backup(){
  echo "[$(date +%F\ %H:%M:%S)] Extracting backup"
  rm -rf "$BACKUP_DIR/*"
  mkdir -p "$BACKUP_DIR"
  tar xzf "$ARCHIVE_PATH" -C "$BACKUP_DIR"
  chown -R 1000:1000 $BACKUP_DIR
}

# Register snapshot repository if needed (may already exist, ignore error)
create_elasticsearch_snapshot_repository(){
  echo "[$(date +%F\ %H:%M:%S)] Refreshing snapshot repository to detect restored files"

  curl -X DELETE "http://$(elasticsearch_host)/_snapshot/ocrvs" && sleep 5|| true
  curl -sS -X PUT -H "Content-Type: application/json;charset=UTF-8" \
    "http://$(elasticsearch_host)/_snapshot/ocrvs" \
    -d '{"type":"fs","settings":{"location":"/data/backups/elasticsearch","compress":true}}' && sleep 10 || exit 1
}

# List available snapshots
list_snapshots(){
  curl -s "http://$(elasticsearch_host)/_cat/snapshots/ocrvs?h=id"
}

# Restore from snapshot
restore_elasticsearch_snapshot(){
  echo "[$(date +%F\ %H:%M:%S)] Restoring Elasticsearch indices from snapshot ${SNAPSHOT_NAME}"
  result=$(curl -sS -X POST -H "Content-Type: application/json" \
    "http://$(elasticsearch_host)/_snapshot/ocrvs/${SNAPSHOT_NAME}/_restore?wait_for_completion=true" \
    -d '{"indices": "ocrvs-*,events_*", "include_global_state": false}')

  if [ $(echo "$result" |  jq '.snapshot.shards.successful') -eq 4 ]; then
    echo "[$(date +%F\ %H:%M:%S)] Restore started/accepted for ${SNAPSHOT_NAME}"
  else
    echo "[$(date +%F\ %H:%M:%S)] [ERROR] Restore did not complete successfully"
    echo "$result"
    exit 1
  fi
}
transfer_from_backup_host
decrypt_backup
extract_backup
echo "[$(date +%F\ %H:%M:%S)] Cleanup existing indices"
/scripts/cleanup.sh

create_elasticsearch_snapshot_repository
echo "[$(date +%F\ %H:%M:%S)] Available snapshots: $(list_snapshots)"

restore_elasticsearch_snapshot
echo "[$(date +%F\ %H:%M:%S)] ==== Restore process finished ===="
