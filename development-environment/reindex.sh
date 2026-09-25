#!/usr/bin/env bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

set -euo pipefail

print_usage_and_exit () {
  echo 'Usage: pnpm reindex [--env <name>]'
  echo
  echo "Rebuilds ONE environment's Elasticsearch indices from its database."
  echo "With no --env, that is the environment this git worktree owns."
  echo "Run 'pnpm env:list' to see which environments exist."
  exit 1
}

DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.."; pwd)
cd "$DIR"

# Remembered before the contract is loaded so that a hand-exported EVENTS_URL /
# AUTH_URL still wins, as it did before this script resolved an environment of
# its own — but only when it really is hand-exported. Once a contract is in the
# environment (inside `pnpm dev`'s process tree, or after an `env:lookup` eval)
# EVENTS_URL is the *inherited environment's* URL and is indistinguishable from
# a deliberate override; treating it as one is how `--env other` ended up
# announcing one environment and reindexing another. The presence of the
# contract's identity variables is what tells the two cases apart.
if [ -n "${OPENCRVS_ENV_NAME:-}" ] && [ -n "${OPENCRVS_ENV_SLOT:-}" ]; then
  EVENTS_URL_OVERRIDE=""
  AUTH_URL_OVERRIDE=""
else
  EVENTS_URL_OVERRIDE="${EVENTS_URL:-}"
  AUTH_URL_OVERRIDE="${AUTH_URL:-}"
fi

# Which environment's events and auth services to talk to. `packages/dev-cli`
# owns the port arithmetic; this script only reads the resulting URLs.
# See development-environment/environment.sh.
source "$DIR/development-environment/environment.sh"
opencrvs_env_load "$@" || print_usage_and_exit

# An explicit `--env <name>` names the environment to act on and nothing may
# outrank it, so that the banner below can never disagree with the URLs curl
# is given.
if [ -n "${OPENCRVS_ENV_ARG:-}" ]; then
  EVENTS_URL_OVERRIDE=""
  AUTH_URL_OVERRIDE=""
fi

EVENTS_URL="${EVENTS_URL_OVERRIDE:-$EVENTS_URL}"
AUTH_URL="${AUTH_URL_OVERRIDE:-$AUTH_URL}"

echo "Reindexing environment ${OPENCRVS_ENV_NAME} (slot ${OPENCRVS_ENV_SLOT})"
echo "  events  ${EVENTS_URL}"
echo "  auth    ${AUTH_URL}"
if [ -n "${EVENTS_URL_OVERRIDE:-}" ] || [ -n "${AUTH_URL_OVERRIDE:-}" ]; then
  echo "  (URLs taken from the environment, not from that environment's contract)"
fi
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
    -d '{"waitForCompletion": false}' \
    "${EVENTS_URL%/}/events/reindex"
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
