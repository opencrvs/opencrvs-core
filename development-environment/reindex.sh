# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

#!/usr/bin/env bash
set -euo pipefail

EVENTS_URL="${EVENTS_URL:-http://localhost:5555/}"
AUTH_URL="${AUTH_URL:-http://localhost:4040/}"
# How often (seconds) to poll the status endpoint
POLL_INTERVAL="${POLL_INTERVAL:-10}"
# Maximum number of poll iterations (~3 hours at the default interval)
MAX_POLLS="${MAX_POLLS:-1080}"

get_reindexing_token() {
  curl -s "${AUTH_URL%/}/internal/reindexing-token" | jq -r '.token'
}

# Fires POST /events/reindex in a background subshell.
# The response is intentionally discarded — reindexing can take a long time
# and may even time out at the HTTP level. Progress is tracked via polling.
fire_trigger() {
  local token=$1
  curl -s -o /dev/null \
    -X POST \
    -H "Authorization: Bearer ${token}" \
    -H "Content-Type: application/json" \
    "${EVENTS_URL%/}/events/reindex" &
}

# Returns the most recent reindex status document whose timestamp >= $2,
# as a compact JSON object, or empty string if none found yet.
# Both sides of the comparison are truncated to 19 chars (YYYY-MM-DDTHH:MM:SS)
# to avoid the '.' < 'Z' string-sort trap with millisecond timestamps.
fetch_latest_run_since() {
  local token=$1 since=$2
  curl -s \
    -H "Authorization: Bearer ${token}" \
    -H "Content-Type: application/json" \
    "${EVENTS_URL%/}/events/reindex" \
  | jq -c --arg since "${since:0:19}" \
    'map(select(.timestamp[0:19] >= $since)) | sort_by(.timestamp) | reverse | .[0] // empty'
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

# Capture wall-clock time BEFORE fetching the token so it is always
# earlier than the status document the server writes. Stored timestamps
# include milliseconds (e.g. 2026-03-06T09:53:08.123Z), so we keep only
# the first 19 chars (YYYY-MM-DDTHH:MM:SS) for the comparison to avoid
# the '.' < 'Z' string-sort trap.
TRIGGER_TIME=$(date -u +"%Y-%m-%dT%H:%M:%S")

echo "Requesting reindex token..."
TOKEN=$(get_reindexing_token)

echo "Triggering reindex..."
fire_trigger "$TOKEN"

echo "Polling reindex status..."
polls=0
first_poll=true
while true; do
  if [[ "$first_poll" == true ]]; then
    sleep 3
    first_poll=false
  else
    sleep "$POLL_INTERVAL"
  fi
  polls=$((polls + 1))

  RUN=$(fetch_latest_run_since "$TOKEN" "$TRIGGER_TIME")

  if [[ -z "$RUN" ]]; then
    echo "  Waiting for reindex to start... (${polls})"

    if (( polls > MAX_POLLS )); then
      echo "ERROR: timed out waiting for reindex to start."
      exit 1
    fi
    continue
  fi

  STATUS=$(echo "$RUN" | jq -r '.status')
  PROCESSED=$(echo "$RUN" | jq -r '.progress.processed')

  case "$STATUS" in
    running)
      echo "  Running... ${PROCESSED} events processed so far"
      if (( polls > MAX_POLLS )); then
        echo "ERROR: reindex timed out after $((polls * POLL_INTERVAL)) seconds."
        exit 1
      fi
      ;;
    completed)
      echo "  Reindex completed — ${PROCESSED} events processed."
      exit 0
      ;;
    failed)
      ERROR=$(echo "$RUN" | jq -r '.error_message // "unknown error"')
      echo "  ERROR: reindex failed: ${ERROR}"
      exit 1
      ;;
    *)
      echo "  Unknown status '${STATUS}' — continuing to poll..."
      if (( polls > MAX_POLLS )); then
        exit 1
      fi
      ;;
  esac
done