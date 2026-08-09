#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

set -e # fail if any of the commands fails

# Same connection as run-migrations.sh: reverting is DDL, so it must be the
# `events_migrator` role, not the application's EVENTS_POSTGRES_URL. That name
# stays in the chain for deployed environments that still set only it.
: "${EVENTS_MIGRATOR_URL:=${EVENTS_POSTGRES_URL:-postgres://events_migrator:migrator_password@localhost:5432/events}}"

SCRIPT_PATH=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

# Revert all events migrations (one node-pg-migrate step per migration file)
EVENTS_FILES=$(ls "$SCRIPT_PATH/src/migrations/events" | grep -E '\.(sql|js)$' | wc -l)
for ((n = 0; n < EVENTS_FILES; n++)); do
  DATABASE_URL="$EVENTS_MIGRATOR_URL" \
    pnpm --dir "$SCRIPT_PATH" exec node-pg-migrate down \
    --schema=app \
    --migrations-dir="$SCRIPT_PATH/src/migrations/events"
done
