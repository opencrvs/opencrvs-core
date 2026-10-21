#!/bin/sh

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# Backs up the object store to the backup server, as a full backup or as a differential.
#
#   BACKUP_MODE   full, or differential: what is new or changed since the latest complete full
#                 backup. Without one, a differential becomes a full backup.
#   BACKUP_DATE   name of the backup, default today. The same date again replaces the backup.
#   KEEP_FULLS    full backups to keep, with the differentials that are based on them, default 0
#                 which keeps all. Older ones are deleted at the end of a successful backup.
#   BUCKETS       default: every bucket of the store
#
# See common.sh for the layout, and for the settings of the remotes.

set -u
. "$(dirname "$0")/common.sh"

MODE="${BACKUP_MODE:-full}"
DATE="${BACKUP_DATE:-$(date +%F)}"
KEEP_FULLS="${KEEP_FULLS:-0}"

case "$MODE" in full | differential) ;; *) fail "BACKUP_MODE must be full or differential, not '$MODE'" ;; esac
case "$KEEP_FULLS" in '' | *[!0-9]*) fail "KEEP_FULLS must be a number, not '$KEEP_FULLS'" ;; esac

setup_remotes
wait_for store:
wait_for repo:
check_repository_key

BASE=""
if [ "$MODE" = "differential" ]; then
  BASE=$(complete_backups full | head -n 1)
  if [ -z "$BASE" ]; then
    log "WARNING: there is no complete full backup to base a differential on, so this is a full backup"
    MODE=full
  fi
fi

if [ "$MODE" = "full" ]; then
  DIR="full/$DATE"
else
  DIR="diff/$DATE"
fi
log "Backup $DIR${BASE:+, based on the full backup of $BASE}"

BUCKET_LIST=$(store_buckets) || fail "Could not list the buckets of the store"

# A backup that is being rewritten must not look complete
rclone deletefile "repo:$DIR/COMPLETE" > /dev/null 2>&1 || true

# The manifest comes first: it is the state that this backup represents. Objects that arrive
# while the copy runs are copied as well, and restored only if they are in the manifest.
: > /tmp/manifest.tsv
for bucket in $BUCKET_LIST; do
  # Not piped, so that a failing rclone is not hidden by the exit status of awk
  listing=$(rclone lsf -R --files-only --format pM --separator "$TAB" "store:$bucket") \
    || fail "Could not list bucket $bucket"
  printf '%s\n' "$listing" | awk -F"$TAB" -v bucket="$bucket" 'NF >= 1 && $1 != "" { print bucket "/" $1 "\t" $2 }' >> /tmp/manifest.tsv
done
printf '%s\n' "$BUCKET_LIST" > /tmp/buckets.txt
log "$(wc -l < /tmp/manifest.tsv | tr -d ' ') objects in $(wc -l < /tmp/buckets.txt | tr -d ' ') bucket(s)"

for bucket in $BUCKET_LIST; do
  if [ "$MODE" = "full" ]; then
    rclone copy "store:$bucket" "repo:$DIR/data/$bucket" \
      --stats 30s --stats-one-line --stats-log-level NOTICE || fail "Copy of bucket $bucket failed"
  else
    rclone copy --compare-dest "repo:full/$BASE/data/$bucket" "store:$bucket" "repo:$DIR/data/$bucket" \
      --stats 30s --stats-one-line --stats-log-level NOTICE || fail "Copy of bucket $bucket failed"
  fi
done

rclone copyto /tmp/manifest.tsv "repo:$DIR/manifest.tsv" || fail "Could not store the manifest"
rclone copyto /tmp/buckets.txt "repo:$DIR/buckets.txt" || fail "Could not store the bucket list"
if [ -n "$BASE" ]; then
  printf '%s\n' "$BASE" | rclone rcat "repo:$DIR/BASE" || fail "Could not store the base of the differential"
fi

# Every key of the manifest must be in this backup, or in the full backup that it is based on
: > /tmp/missing.txt
for bucket in $BUCKET_LIST; do
  rclone lsf -R --files-only "repo:$DIR/data/$bucket" 2> /dev/null | sed "s#^#$bucket/#" > /tmp/stored.txt
  if [ -n "$BASE" ]; then
    rclone lsf -R --files-only "repo:full/$BASE/data/$bucket" 2> /dev/null | sed "s#^#$bucket/#" >> /tmp/stored.txt
  fi
  sort -u /tmp/stored.txt > /tmp/stored.sorted
  # By the literal prefix, as the name of a bucket can hold characters that a pattern reads
  awk -F"$TAB" -v prefix="$bucket/" 'index($1, prefix) == 1 { print $1 }' /tmp/manifest.tsv | sort -u > /tmp/wanted.sorted
  comm -23 /tmp/wanted.sorted /tmp/stored.sorted >> /tmp/missing.txt
done
if [ -s /tmp/missing.txt ]; then
  log "ERROR: $(wc -l < /tmp/missing.txt | tr -d ' ') object(s) of the manifest are not in the backup, for example:"
  head -n 5 /tmp/missing.txt
  fail "Backup $DIR is not complete"
fi

printf '%s\n' "$(date '+%F %H:%M:%S')" | rclone rcat "repo:$DIR/COMPLETE" || fail "Could not mark the backup as complete"
log "Backup $DIR is complete"

if [ "$MODE" = "full" ] && [ "$KEEP_FULLS" -gt 0 ]; then
  KEEP=$(complete_backups full | head -n "$KEEP_FULLS")
  for old in $(complete_backups full); do
    if ! echo "$KEEP" | grep -qx "$old"; then
      log "Deleting the full backup of $old, and the differentials that are based on it"
      for d in $(rclone lsf repo:diff --dirs-only 2> /dev/null | sed 's:/$::'); do
        if [ "$(rclone cat "repo:diff/$d/BASE" 2> /dev/null)" = "$old" ]; then
          rclone purge "repo:diff/$d" || log "WARNING: could not delete diff/$d"
        fi
      done
      rclone purge "repo:full/$old" || log "WARNING: could not delete full/$old"
    fi
  done
fi
