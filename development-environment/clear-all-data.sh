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

# Container of the shared dependency singleton, which runs as the docker
# compose project `opencrvs-deps`. `setup-analytics` below reaches Postgres
# through it.
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-opencrvs-deps-postgres-1}"

echo
echo "Clearing one environment's data. Nothing else on this machine is touched."
echo
opencrvs_env_describe
echo

# Empties this environment's search indices, bucket and mosip-api token store
# and drops its `app` and `analytics` schemas. `env:clear` shares its index
# selection and its docker adapter with `pnpm env:destroy`, so it can never
# take a neighbouring environment's indices with it: `events` (the default
# environment) is a prefix of `events_feature_a`. See
# packages/dev-cli/src/environment-data.ts.
opencrvs_env_cli env:clear

##################################
# Recreate schemas and migrate   #
##################################

# `provision` is idempotent and is the same command `pnpm dev` runs: it creates
# the database if it is missing, creates whichever of the app/analytics/
# reference_data schemas are missing, grants the shared roles, and runs the
# migrations. It creates `analytics` empty; `setup-analytics` fills in its
# tables, which a running stack would otherwise only get back on restart.
echo
pnpm --filter @opencrvs/migration provision --db "$TARGET_DB"
POSTGRES_CONTAINER="$POSTGRES_CONTAINER" pnpm --filter @opencrvs/testland setup-analytics
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
