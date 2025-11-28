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

get_reindexing_token() {
  curl -s "${AUTH_URL%/}/internal/reindexing-token" | jq -r '.token'
}

trigger_reindex() {
  local token
  token=$(get_reindexing_token)
  curl -s -f -X POST \
    -H "Authorization: Bearer ${token}" \
    -H "Content-Type: application/json" \
    "${EVENTS_URL%/}/events/reindex"
}

reindexing_attempts=0
while true; do
  if [[ $reindexing_attempts -eq 0 ]]; then
    echo "Reindexing search..."
  else
    echo "Reindexing search... (attempt ${reindexing_attempts})"
  fi

  if trigger_reindex; then
    echo "...done reindexing"
    exit 0
  else
    reindexing_attempts=$((reindexing_attempts + 1))
    if (( reindexing_attempts > 30 )); then
      echo "Failed to reindex search after ${reindexing_attempts} attempts."
      exit 1
    fi
    sleep 5
  fi
done