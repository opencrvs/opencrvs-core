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
    echo 'Usage: pnpm db:clear:all [--env <name>]'
    echo
    echo "Clears the data of ONE OpenCRVS environment: its Postgres database,"
    echo "its Elasticsearch indices, its MinIO bucket and its mosip-api token"
    echo "store. Every other environment on this machine is left untouched."
    echo
    echo "With no --env, the environment is the one this git worktree owns —"
    echo "in an ordinary checkout that is the default 'events' / 'ocrvs' data."
    echo "Pass --env <name> to clear a named environment from anywhere."
    echo "Run 'pnpm env:list' to see which environments exist."
    exit 1
}

# The compose `-f` paths in the root package.json are relative to the
# repository root, and dev-cli derives this environment's identity from the
# enclosing git worktree, so everything below runs from the root.
DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.."; pwd)
cd "$DIR"

# `packages/dev-cli` owns every identifier; this script only ever reads them.
# See development-environment/environment.sh.
source "$DIR/development-environment/environment.sh"
opencrvs_env_load "$@" || print_usage_and_exit

# Containers of the shared dependency singleton, which runs as the docker compose
# project `opencrvs-deps` (see docs/adr/0003-multiple-local-environments.md).
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-opencrvs-deps-postgres-1}"
MINIO_CONTAINER="${MINIO_CONTAINER:-opencrvs-deps-minio-1}"
ELASTICSEARCH_URL="${ELASTICSEARCH_URL:-http://localhost:9200}"

echo
echo "Clearing one environment's data. Nothing else on this machine is touched."
echo
opencrvs_env_describe
echo

#############################
# Clear Elasticsearch       #
#############################

# The indices are selected by `dev-cli`, never by a prefix match here: `events`
# (the default environment) is a *prefix of* `events_feature_a`, so a naive
# match would make clearing the default environment sweep every named
# environment's search data with it. `env:indices` applies the same
# longest-prefix-wins rule `pnpm env:destroy` uses, and only ever returns
# indices it can positively attribute to this environment — including to
# environments that exist in Postgres but are missing from the registry.
#
# It writes to stderr and returns nothing when it cannot establish that set, so
# the warning is surfaced here rather than swallowed by the command
# substitution.
INDEX_WARNINGS=$(mktemp)
trap 'rm -f "$INDEX_WARNINGS"' EXIT

INDICES=$(curl -fsS "$ELASTICSEARCH_URL/_cat/indices?h=index" \
  | opencrvs_env_cli env:indices 2>"$INDEX_WARNINGS")

if [ -s "$INDEX_WARNINGS" ]; then
  cat "$INDEX_WARNINGS" >&2
fi

if [ -z "$INDICES" ]; then
  if [ -s "$INDEX_WARNINGS" ]; then
    echo "Elasticsearch was left untouched — see the warning above."
  else
    echo "No Elasticsearch indices belong to this environment."
  fi
else
  while read -r index; do
    [ -n "$index" ] || continue
    echo "Deleting index: $index"
    curl -fsS -o /dev/null -XDELETE "$ELASTICSEARCH_URL/$index"
  done <<< "$INDICES"
  echo "**** Removed this environment's Elasticsearch indices ****"
fi

####################
# Clear MinIO      #
####################

# Storage lives in the `opencrvs-deps_minio` named volume, so there is no host
# directory to probe — key off the running container instead. Only this
# environment's bucket is emptied; every other bucket in the volume is left as
# it is.
if docker inspect "$MINIO_CONTAINER" >/dev/null 2>&1; then
  docker exec "$MINIO_CONTAINER" sh -c "rm -rf /data/$MINIO_BUCKET/*"
  docker exec "$MINIO_CONTAINER" mkdir -p "/data/$MINIO_BUCKET"
  echo "**** Removed minio data from bucket $MINIO_BUCKET ****"
else
  echo "MinIO container $MINIO_CONTAINER is not running; skipped its bucket."
fi

##########################################
# Clear the mosip-api SQLite token store #
##########################################

# The one piece of this environment's data that lives in the checkout rather
# than in a shared datastore: `packages/mosip-api` keeps a record-only token per
# MOSIP transaction here. `SQLITE_DATABASE_PATH` is per-environment (see
# packages/dev-cli/src/env-contract.ts), so this removes only ours. mosip-api
# recreates the file and its schema on next start.
if [ -n "${SQLITE_DATABASE_PATH:-}" ] && [ -f "$SQLITE_DATABASE_PATH" ]; then
  rm -f "$SQLITE_DATABASE_PATH"
  echo "**** Removed the mosip-api token store $SQLITE_DATABASE_PATH ****"
fi

####################
# Clear PostgreSQL #
####################

echo "Resetting schema 'app' in database '$TARGET_DB'..."

# Dropped only if the database exists: clearing an environment that has never
# been started is a no-op here, and provisioning below creates it.
if [ "$(docker exec -i "$POSTGRES_CONTAINER" psql -U postgres -d postgres -tAc \
  "SELECT 1 FROM pg_database WHERE datname = '$TARGET_DB'")" = "1" ]; then
  docker exec -i "$POSTGRES_CONTAINER" psql -U postgres -d "$TARGET_DB" \
    -v ON_ERROR_STOP=1 -c "DROP SCHEMA IF EXISTS app CASCADE"
  echo "Schema 'app' dropped."
else
  echo "Database '$TARGET_DB' does not exist yet; it will be created."
fi

##################################
# Recreate schemas and migrate   #
##################################

# `provision` is idempotent and is the same command `pnpm dev` runs: it creates
# the database if it is missing, recreates the app/analytics/reference_data
# schemas with the shared roles, and runs the migrations.
echo
pnpm --filter @opencrvs/migration provision --db "$TARGET_DB"
echo

##################################
# Rebuild the search indices     #
##################################

# Reindexing needs this environment's services to be up. When they are not,
# saying so beats failing: the data is already cleared, and `pnpm reindex`
# picks up from here once `pnpm dev` is running.
if curl -fsS -o /dev/null --connect-timeout 3 --max-time 10 \
  "${AUTH_URL%/}/internal/reindexing-token"; then
  pnpm reindex
else
  echo "The auth service at ${AUTH_URL} is not responding, so the search"
  echo "indices were not rebuilt. Run 'pnpm reindex' once 'pnpm dev' is up."
fi
echo
