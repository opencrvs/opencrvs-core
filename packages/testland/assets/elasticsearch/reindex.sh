#!/usr/bin/env sh
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

set -eu

EVENTS_URL="${EVENTS_URL:-http://localhost:5555/}"
AUTH_URL="${AUTH_URL:-http://localhost:4040/}"
POLL_INTERVAL="${POLL_INTERVAL:-10}"
MAX_POLLS="${MAX_POLLS:-1080}"

get_reindexing_token() {
  curl -s "${AUTH_URL%/}/internal/reindexing-token" | jq -r '.token'
}

fire_trigger() {
  local token=$1
  curl -s -o /dev/null \
    -X POST \
    -H "Authorization: Bearer ${token}" \
    -H "Content-Type: application/json" \
    -d '{"waitForCompletion": false}' \
    "${EVENTS_URL%/}/events/reindex"
}

fetch_latest_run_since() {
  local token=$1
  local since
  local response
  local tmp
  local json_type
  local code

  since=$(echo "$2" | cut -c1-19)
  tmp=$(mktemp)

  response=$(curl -sS \
    -H "Authorization: Bearer ${token}" \
    -H "Content-Type: application/json" \
    "${EVENTS_URL%/}/events/reindex" 2>&1) || {
      echo "ERROR: failed to fetch reindex status:" >&2
      echo "$response" >&2
      rm -f "$tmp"
      return 1
    }

  printf '%s' "$response" > "$tmp"

  json_type=$(jq -r 'type' "$tmp" 2>/dev/null) || {
    echo "ERROR: reindex status response is not valid JSON:" >&2
    cat "$tmp" >&2
    rm -f "$tmp"
    return 1
  }

  if [ "$json_type" != "array" ]; then
    code=$(jq -r '.code // .data.code // empty' "$tmp")

    if [ "$code" = "UNAUTHORIZED" ]; then
      echo "WARN: reindex status token expired; refreshing token..." >&2
      rm -f "$tmp"
      return 2
    fi

    echo "ERROR: unexpected reindex status response:" >&2
    jq -c '.' "$tmp" >&2
    rm -f "$tmp"
    return 1
  fi

  jq -c --arg since "$since" \
    'map(select(.timestamp[0:19] >= $since)) | sort_by(.timestamp) | reverse | .[0] // empty' \
    "$tmp"

  rm -f "$tmp"
}

TRIGGER_TIME=$(date -u +"%Y-%m-%dT%H:%M:%S")

echo "Requesting reindex token..."
TOKEN=$(get_reindexing_token)

echo "Triggering reindex..."
fire_trigger "$TOKEN"

echo "Polling reindex status..."
polls=0
first_poll=true
while true; do
  if [ "$first_poll" = true ]; then
    sleep 3
    first_poll=false
  else
    sleep "${POLL_INTERVAL}"
  fi
  polls=$(( ${polls:-0} + 1 ))

  if RUN=$(fetch_latest_run_since "$TOKEN" "$TRIGGER_TIME"); then
    :
  else
    rc=$?

    if [ "$rc" -eq 2 ]; then
        echo "  Token expired, refreshing token..."
        TOKEN=$(get_reindexing_token)

        if RUN=$(fetch_latest_run_since "$TOKEN" "$TRIGGER_TIME"); then
          :
        else
          echo "ERROR: failed to fetch reindex status after refreshing token."
          exit 1
        fi
      else
        echo "ERROR: failed to fetch reindex status."
        exit 1
      fi
  fi

  if [ -z "$RUN" ]; then
    echo "  Waiting for reindex to start... (${polls})"
    if [ "${polls}" -gt "${MAX_POLLS}" ]; then
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
      if [ "${polls}" -gt "${MAX_POLLS}" ]; then
        timeout_secs=$(( ${polls:-0} * ${POLL_INTERVAL:-10} ))
        echo "ERROR: reindex timed out after ${timeout_secs} seconds."
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
      if [ "${polls}" -gt "${MAX_POLLS}" ]; then
        exit 1
      fi
      ;;
  esac
done