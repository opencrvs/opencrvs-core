#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# Install required tools
apk add --no-cache bash curl openssl openssh jq rsync

# Initial variables configuration
# Today's date is used for filenames if LABEL is not provided
BACKUP_DATE=$(date +%Y-%m-%d)
# Local directory inside container
BACKUP_DIR="/data/backups/elasticsearch"
# Temporal archive path inside container
ARCHIVE_PATH="/tmp/elasticsearch_backup_${BACKUP_DATE}.tar.gz"
# Remote directory on backup server
REMOTE_DIR="${BACKUP_REMOTE_DIR:-"/home/$BACKUP_USER"}/$BACKUP_DATE"
# Number of retries for backup creation
MAX_RETRIES=10
# Reference to container within the same k8s pod
ELASTIC_HOST=${ELASTIC_HOST:-"elasticsearch:9200"}
# Snapshot name, default to snapshot_YYYY-MM-DD
SNAPSHOT_NAME=${SNAPSHOT_NAME:-"snapshot_${BACKUP_DATE}"}

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

# List indices on server by patterns ocrvs-|events_
get_target_indices() {
  curl -s "http://$(elasticsearch_host)/_cat/indices?h=index" \
    | grep -E '^(ocrvs-|events_)' \
    | paste -sd, - \
    | sed 's/\,$//'
}

create_elasticsearch_snapshot_repository() {
  echo "[$(date +%F\ %H:%M:%S)] Register backup folder as an Elasticsearch repository for backing up the search data"
  for i in $(seq 1 $MAX_RETRIES); do
    OUTPUT=$(curl -sS -X PUT -H "Content-Type: application/json;charset=UTF-8" \
      "http://$(elasticsearch_host)/_snapshot/ocrvs" \
      -d '{"type":"fs","settings":{"location":"/data/backups/elasticsearch","compress":true}}')

    if [ "$OUTPUT" = '{"acknowledged":true}' ]; then
      echo "[$(date +%F\ %H:%M:%S)] Repository registered"
      return 0
    fi
    echo "[$(date +%F\ %H:%M:%S)] Failed to register repository (attempt $i/$MAX_RETRIES)..."
    sleep 2
  done
  echo "[$(date +%F\ %H:%M:%S)] ERROR: Could not register repository after $MAX_RETRIES attempts."
  exit 1
}

create_elasticsearch_backup() {
  echo "[$(date +%F\ %H:%M:%S)] Backup Elasticsearch as a set of snapshot files into an elasticsearch sub folder"
  local indices=$(get_target_indices)
  if [ -z "$indices" ]; then
    echo "[$(date +%F\ %H:%M:%S)] No indices matching ocrvs-* or events_* found, skipping snapshot."
    return 1
  fi

  local retries=10
  for i in $(seq 1 $retries); do
    local output
    output=$(curl -sS -X PUT -H "Content-Type: application/json;charset=UTF-8" \
      "http://$(elasticsearch_host)/_snapshot/ocrvs/${SNAPSHOT_NAME}?wait_for_completion=true&pretty" \
      -d "{
        \"indices\": \"${indices}\",
        \"include_global_state\": false,
        \"metadata\": {
          \"taken_by\": \"backup script\",
          \"taken_because\": \"scheduled backup\"
        }
      }")
    if echo "$output" | jq -e '.snapshot.state == "SUCCESS"' > /dev/null; then
      echo "[$(date +%F\ %H:%M:%S)] Snapshot state is SUCCESS"
      return 0
    fi
    echo "$output"
    echo "[$(date +%F\ %H:%M:%S)] Failed to backup Elasticsearch. Retrying $i/$retries ..."
    sleep 5
  done
  echo "[$(date +%F\ %H:%M:%S)] ERROR: Could not complete snapshot after $retries attempts."
  exit 1
}

delete_all_snapshots() {
  # List all snapshots in ocrvs repo
  echo "[$(date +%F\ %H:%M:%S)] Delete all currently existing snapshots"
  for snap in $(curl -s "http://$(elasticsearch_host)/_cat/snapshots/ocrvs?h=id"); do
    echo "[$(date +%F\ %H:%M:%S)] Deleting snapshot $snap"
    curl -sX DELETE "http://$(elasticsearch_host)/_snapshot/ocrvs/$snap"
    sleep 1
  done
}

create_encrypted_backup(){
  echo "[$(date +%F\ %H:%M:%S)] Archive and Encrypt backup at $ARCHIVE_PATH"
  # Tar/gzip all snapshot content
  tar czf "$ARCHIVE_PATH" -C "$BACKUP_DIR" .

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

echo "[$(date +%F\ %H:%M:%S)] Running backup container"

delete_all_snapshots

echo "[$(date +%F\ %H:%M:%S)] Indices available for backup: $(get_target_indices)"

create_elasticsearch_snapshot_repository

create_elasticsearch_backup

create_encrypted_backup

transfer_to_backup_host
