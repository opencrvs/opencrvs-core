#!/bin/sh

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# Restores the object store from the backup server. The store is emptied first: every bucket is
# deleted, then the buckets of the backup are created and filled, so the store ends up as it was
# when the backup was made. Run it against an environment that may be overwritten.
#
#   RESTORE_DATE  the newest complete backup on or before this date, for example 2026-10-21.
#                 Default: the newest complete backup. A differential is restored together with
#                 the full backup it is based on.
#
# See common.sh for the layout, and for the settings of the remotes.

set -u
. "$(dirname "$0")/common.sh"

RESTORE_DATE="${RESTORE_DATE:-}"
case "$RESTORE_DATE" in '' | [0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]) ;; *) fail "RESTORE_DATE must look like 2026-10-21, not '$RESTORE_DATE'" ;; esac

setup_remotes
wait_for store:
wait_for repo:
check_repository_key

# Complete backups, newest first. On the same date, the differential is later than the full backup.
{
  complete_backups diff | sed 's/$/ diff/'
  complete_backups full | sed 's/$/ full/'
} | sort -k1,1r -k2,2 > /tmp/candidates.txt

if [ -n "$RESTORE_DATE" ]; then
  awk -v limit="$RESTORE_DATE" '$1 <= limit' /tmp/candidates.txt > /tmp/candidates.filtered
  mv /tmp/candidates.filtered /tmp/candidates.txt
fi

[ -s /tmp/candidates.txt ] || fail "There is no complete backup${RESTORE_DATE:+ on or before $RESTORE_DATE} on the backup server"
read -r DATE KIND < /tmp/candidates.txt
DIR="$KIND/$DATE"

# Where the objects are read from, as a prefix of the bucket name
BASE=""
SOURCE="repo:$DIR/data/"
if [ "$KIND" = "diff" ]; then
  BASE=$(rclone cat "repo:$DIR/BASE") || fail "Could not read the base of the differential $DATE"
  is_complete "full/$BASE" || fail "The differential $DATE is based on the full backup of $BASE, which is not complete or does not exist"
  # The differential is laid over the full backup. Where both have an object, the differential wins.
  # (rclone needs two upstreams for a union, so a full backup is read directly.)
  export RCLONE_CONFIG_VIEW_TYPE=union
  export RCLONE_CONFIG_VIEW_UPSTREAMS="repo:$DIR/data repo:full/$BASE/data"
  SOURCE="view:"
fi
log "Restoring $DIR${BASE:+, together with the full backup of $BASE}"

rclone cat "repo:$DIR/manifest.tsv" > /tmp/manifest.tsv || fail "Could not read the manifest of $DIR"
rclone cat "repo:$DIR/buckets.txt" > /tmp/buckets.txt || fail "Could not read the bucket list of $DIR"

existing=$(rclone lsf store: --dirs-only) || fail "Could not list the buckets of the store"
for bucket in $(printf '%s\n' "$existing" | sed 's:/$::'); do
  log "WARNING: deleting bucket $bucket of the store"
  rclone purge "store:$bucket" || fail "Could not delete bucket $bucket"
done

while read -r bucket; do
  [ -n "$bucket" ] || continue
  rclone mkdir "store:$bucket" || fail "Could not create bucket $bucket"
done < /tmp/buckets.txt

# Only the keys of the manifest are restored, so what was deleted before the backup stays deleted.
# The keys are grouped by creator and content type, since metadata can be set for a group of
# objects, and not for each of them: that is one rclone call per group.
rm -rf /tmp/groups
mkdir -p /tmp/groups
awk -F"$TAB" '
{
  p = $1; json = $2; cb = ""; ct = ""
  slash = index(p, "/"); bucket = substr(p, 1, slash - 1); key = substr(p, slash + 1)
  if (match(json, /"created-by":"[^"]*"/))   cb = substr(json, RSTART + 14, RLENGTH - 15)
  if (match(json, /"content-type":"[^"]*"/)) ct = substr(json, RSTART + 16, RLENGTH - 17)
  group = bucket "#" cb "#" ct
  if (!(group in number)) { number[group] = ++count; label[count] = group }
  print key > ("/tmp/groups/" number[group] ".list")
}
END { for (i = 1; i <= count; i++) print i "#" label[i] > "/tmp/groups/index" }
' /tmp/manifest.tsv

if [ -s /tmp/groups/index ]; then
  log "$(wc -l < /tmp/groups/index | tr -d ' ') group(s) of objects with the same creator and content type"
  while IFS='#' read -r n bucket creator ctype; do
    set -- --files-from "/tmp/groups/$n.list" --metadata
    [ -n "$creator" ] && set -- "$@" --metadata-set "created-by=$creator"
    [ -n "$ctype" ] && set -- "$@" --metadata-set "content-type=$ctype"
    rclone copy "$@" "$SOURCE$bucket" "store:$bucket" || fail "Restore of group $n of bucket $bucket failed"
  done < /tmp/groups/index
fi

# Compare the store with the manifest
status=0
while read -r bucket; do
  [ -n "$bucket" ] || continue
  expected=$(awk -F"$TAB" -v prefix="$bucket/" 'index($1, prefix) == 1' /tmp/manifest.tsv | wc -l | tr -d ' ')
  found=$(rclone lsf -R --files-only "store:$bucket" | wc -l | tr -d ' ')
  if [ "$expected" != "$found" ]; then
    log "ERROR: bucket $bucket should have $expected object(s), and has $found"
    status=1
  else
    log "Bucket $bucket: $found object(s)"
  fi
done < /tmp/buckets.txt
[ "$status" = 0 ] || fail "The restored store does not match the backup"
log "Restore of $DIR finished"
