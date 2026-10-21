# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# Shared by backup.sh and restore.sh.
#
# Remotes, all taken from the environment of the job:
#   store    the object store, defined by RCLONE_CONFIG_STORE_*
#   sftp     the backup server, defined by RCLONE_CONFIG_SFTP_*
#   repo     the backup repository: an encrypted view of ${BACKUP_REMOTE_DIR}/seaweedfs on the
#            backup server. File names and contents are encrypted with ENCRYPT_PASS, so the
#            layout below is visible to rclone only.
#
# The repository holds dated backups. A backup is complete only when it has a COMPLETE file,
# which is written last, so a backup that was interrupted is never used.
#
#   full/<date>/data/<bucket>/...   every object of the bucket
#   full/<date>/manifest.tsv        every live key with its metadata, at the time of the backup
#   full/<date>/buckets.txt         the buckets, so that empty ones come back as well
#   diff/<date>/data/<bucket>/...   the objects that are new or changed since the full it is based on
#   diff/<date>/manifest.tsv        every live key at the time of the differential
#   diff/<date>/BASE                the date of that full
#
# Object metadata (created-by, content type) cannot be stored in files on an SFTP server, so it
# is kept in the manifest, and applied again when the objects are restored.

TAB=$(printf '\t')

log() {
  echo "[$(date '+%F %H:%M:%S')] $*"
}

fail() {
  log "ERROR: $*"
  exit 1
}

setup_remotes() {
  # An empty file, so that rclone does not warn that it has no config file
  export RCLONE_CONFIG=/tmp/rclone.conf
  : > "$RCLONE_CONFIG"

  [ -n "${ENCRYPT_PASS:-}" ] || fail "Must provide ENCRYPT_PASS environment variable"
  [ -n "${BACKUP_REMOTE_DIR:-}" ] || fail "Must provide BACKUP_REMOTE_DIR environment variable"

  # rclone takes the password in an obscured form
  RCLONE_CONFIG_REPO_PASSWORD=$(rclone obscure "$ENCRYPT_PASS") || fail "rclone obscure failed"
  export RCLONE_CONFIG_REPO_PASSWORD
  export RCLONE_CONFIG_REPO_TYPE=crypt
  export RCLONE_CONFIG_REPO_REMOTE="sftp:${BACKUP_REMOTE_DIR%/}/seaweedfs"
}

WAIT_TIMEOUT_SECONDS="${WAIT_TIMEOUT_SECONDS:-600}"

# The repository does not exist before the first backup, so it is created
probe() {
  case "$1" in
    repo:) rclone mkdir repo: && rclone lsd repo: ;;
    *) rclone lsd "$1" ;;
  esac
}

# Pods can start before the store answers, and the backup server can be unreachable for a while
wait_for() {
  remote="$1"
  deadline=$(($(date +%s) + WAIT_TIMEOUT_SECONDS))
  while :; do
    if answer=$(probe "$remote" 2>&1); then
      log "$remote answers"
      return 0
    fi
    # These do not pass with time, so there is no reason to wait for the timeout
    case "$answer" in
      *"knownhosts:"*)
        fail "The host key of the backup server is not the one in known_hosts, or is not listed there. Someone may be impersonating the server, or its key was changed: $answer"
        ;;
      *"StatusCode: 403"* | *"unable to authenticate"* | *"no supported methods remain"* | *"private key"* | *"known_hosts_file"* | *"couldn't parse"*)
        fail "$remote refused the credentials or the settings: $answer"
        ;;
    esac
    if [ "$(date +%s)" -ge "$deadline" ]; then
      fail "$remote did not answer within ${WAIT_TIMEOUT_SECONDS}s. Last answer: $answer"
    fi
    log "Waiting for $remote..."
    sleep 5
  done
}

# The buckets to work on: BUCKETS, or every bucket of the store
store_buckets() {
  if [ -n "${BUCKETS:-}" ]; then
    echo "$BUCKETS" | tr ' ' '\n'
    return 0
  fi
  listing=$(rclone lsf store: --dirs-only) || return 1
  printf '%s\n' "$listing" | sed 's:/$::'
}

# With the wrong password the repository looks empty to rclone: it cannot read the names of what
# is there. A backup would then be written beside it, under another key, and be reported as
# complete although it can never be restored together with the others. So stop here.
check_repository_key() {
  raw=$(rclone lsf "sftp:${BACKUP_REMOTE_DIR%/}/seaweedfs" 2> /dev/null | wc -l | tr -d ' ')
  readable=$(rclone lsf repo: 2> /dev/null | wc -l | tr -d ' ')
  if [ "$raw" -gt 0 ] && [ "$readable" -eq 0 ]; then
    fail "The backup server has $raw entries in ${BACKUP_REMOTE_DIR%/}/seaweedfs, and none can be decrypted: ENCRYPT_PASS is not the password that they were written with"
  fi
  if [ "$readable" -lt "$raw" ]; then
    log "WARNING: $((raw - readable)) of $raw entries in ${BACKUP_REMOTE_DIR%/}/seaweedfs cannot be decrypted with ENCRYPT_PASS"
  fi
}

is_complete() {
  rclone lsf "repo:$1" --files-only 2> /dev/null | grep -qx COMPLETE
}

# Dates of the complete backups under full/ or diff/, newest first
complete_backups() {
  kind="$1"
  for date in $(rclone lsf "repo:$kind" --dirs-only 2> /dev/null | sed 's:/$::' | sort -r); do
    if is_complete "$kind/$date"; then
      echo "$date"
    fi
  done
}
