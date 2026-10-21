#!/bin/sh

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# Copies the objects of MinIO into SeaweedFS, bucket by bucket, with rclone.
#
# The job can run as often as needed. A run copies what the previous ones did
# not, and changes nothing else, so it is safe before and after the services
# switch to SeaweedFS.
#
# The remotes are `minio` and `seaweedfs`. They are defined by the
# RCLONE_CONFIG_MINIO_* and RCLONE_CONFIG_SEAWEEDFS_* environment variables, so
# that no credentials are written to a file.
#
# Settings, all optional:
#   MIGRATION_MODE        copy (default) or sync, see below
#   MIGRATION_VERIFY      hash (default), size, download or none, see below
#   MIGRATION_BUCKETS     buckets to migrate, separated by spaces. Default: every bucket of MinIO
#   MIGRATION_MAX_AGE     only objects younger than this, for example 48h. Default: all
#   WAIT_TIMEOUT_SECONDS  how long to wait for each store to answer, default 600
#
# Why the defaults are what they are:
#
# * `copy --update`, never `sync`. `sync` deletes what SeaweedFS holds and MinIO
#   does not. Once the services write to SeaweedFS, that is every new document,
#   and the job runs again on each upgrade. `--update` leaves objects that are
#   newer in SeaweedFS alone, where a plain `copy` would put the old object of
#   MinIO back over a newer one. `sync` is for clearing out documents that were
#   deleted in MinIO, and only while the services still use MinIO.
#
# * `--metadata`. The documents service stores who created an object in its user
#   metadata, `created-by`, and refuses an upload over a key that another user
#   created. rclone leaves user metadata behind unless it is asked to copy it.
#
# * `rclone mkdir` first. Copying an empty bucket does not create it.

set -u

log() {
  echo "[$(date '+%F %H:%M:%S')] $*"
}

fail() {
  log "ERROR: $*"
  exit 1
}

# An empty file, so that rclone does not warn that it has no config file
export RCLONE_CONFIG=/tmp/rclone.conf
: > "$RCLONE_CONFIG"

MODE="${MIGRATION_MODE:-copy}"
VERIFY="${MIGRATION_VERIFY:-hash}"
WAIT_TIMEOUT_SECONDS="${WAIT_TIMEOUT_SECONDS:-600}"

case "$MODE" in
  copy | sync) ;;
  *) fail "MIGRATION_MODE must be copy or sync, not '$MODE'" ;;
esac

case "$VERIFY" in
  hash | size | download | none) ;;
  *) fail "MIGRATION_VERIFY must be hash, size, download or none, not '$VERIFY'" ;;
esac

# Hooks can start before the pods of the stores are ready
wait_for_store() {
  remote="$1"
  deadline=$(($(date +%s) + WAIT_TIMEOUT_SECONDS))
  while :; do
    if answer=$(rclone lsd "$remote:" 2>&1); then
      log "$remote answers"
      return 0
    fi
    case "$answer" in
      *"StatusCode: 403"*) fail "$remote refused the credentials: $answer" ;;
    esac
    if [ "$(date +%s)" -ge "$deadline" ]; then
      fail "$remote did not answer within ${WAIT_TIMEOUT_SECONDS}s. Last answer: $answer"
    fi
    log "Waiting for $remote..."
    sleep 5
  done
}

# Filters apply to the check as well, so that the check looks at what was copied
filter_flags() {
  if [ -n "${MIGRATION_MAX_AGE:-}" ]; then
    echo "--max-age $MIGRATION_MAX_AGE"
  fi
}

migrate_bucket() {
  bucket="$1"
  log "Bucket $bucket: $MODE from minio to seaweedfs"

  # Before the mkdir below, so that a wrong name does not leave a bucket behind
  if ! rclone lsd "minio:$bucket" > /dev/null 2>&1; then
    log "ERROR: bucket $bucket does not exist in MinIO"
    return 1
  fi

  rclone mkdir "seaweedfs:$bucket" || return 1

  # shellcheck disable=SC2046
  rclone "$MODE" --metadata --update $(filter_flags) \
    --stats 30s --stats-one-line --stats-log-level NOTICE \
    "minio:$bucket" "seaweedfs:$bucket" || return 1

  # After the services switch to SeaweedFS, objects are written and deleted
  # there, so a difference or a missing object is not a failure of the copy.
  # Use `none` for the runs after the switch.
  # shellcheck disable=SC2046
  case "$VERIFY" in
    none)
      log "Bucket $bucket: not verified"
      ;;
    hash)
      rclone check --one-way $(filter_flags) "minio:$bucket" "seaweedfs:$bucket" || return 1
      ;;
    size)
      rclone check --one-way --size-only $(filter_flags) "minio:$bucket" "seaweedfs:$bucket" || return 1
      ;;
    download)
      rclone check --one-way --download $(filter_flags) "minio:$bucket" "seaweedfs:$bucket" || return 1
      ;;
  esac

  log "Bucket $bucket, minio:      $(rclone size "minio:$bucket" 2>&1 | tr '\n' ' ')"
  log "Bucket $bucket, seaweedfs:  $(rclone size "seaweedfs:$bucket" 2>&1 | tr '\n' ' ')"
}

log "Migration of MinIO to SeaweedFS: mode=$MODE verify=$VERIFY max-age=${MIGRATION_MAX_AGE:-none}"
if [ "$MODE" = "sync" ]; then
  log "WARNING: sync deletes the objects of SeaweedFS that MinIO does not have. Run it only while the services still use MinIO."
fi

wait_for_store minio
wait_for_store seaweedfs

if [ -n "${MIGRATION_BUCKETS:-}" ]; then
  BUCKETS="$MIGRATION_BUCKETS"
else
  # Not piped, so that a failing rclone is not hidden by the exit status of sed
  listing=$(rclone lsf minio: --dirs-only) || fail "Could not list the buckets of MinIO"
  BUCKETS=$(printf '%s\n' "$listing" | sed 's:/$::')
fi

if [ -z "$BUCKETS" ]; then
  log "MinIO has no buckets, nothing to migrate"
  exit 0
fi

failed=""
for bucket in $BUCKETS; do
  if ! migrate_bucket "$bucket"; then
    log "ERROR: bucket $bucket was not migrated"
    failed="$failed $bucket"
  fi
done

if [ -n "$failed" ]; then
  fail "Migration failed for:$failed"
fi

log "Migration finished"
