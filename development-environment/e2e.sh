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
  echo 'Usage: pnpm e2e:dev [--env <name>]'
  echo
  echo "Runs the Playwright suite against ONE local environment. With"
  echo "no --env, that is the environment this git worktree owns. Run"
  echo "'pnpm env:list' to see which environments exist."
  echo
  echo "For a deployed environment use 'pnpm --filter @opencrvs/testland e2e'"
  echo "with DOMAIN set; that path is unrelated to local environments."
  exit 1
}

DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.."; pwd)
cd "$DIR"

# Which environment the browser drives. `packages/dev-cli` owns the
# port arithmetic; `packages/testland/e2e/constants.ts` reads the resulting
# URLs straight out of the contract this exports. Without it Playwright would
# fall back to slot 0's literals and quietly create declarations, users and
# corrections in another environment's database — a passing run against the
# wrong environment, which is why the documented entry point goes through here.
# See development-environment/environment.sh.
source "$DIR/development-environment/environment.sh"
opencrvs_env_load "$@" || print_usage_and_exit

echo
echo "Running e2e against environment ${OPENCRVS_ENV_NAME} (slot ${OPENCRVS_ENV_SLOT})"
echo "  client    ${CLIENT_APP_URL}"
echo "  login     ${LOGIN_URL}"
echo "  gateway   ${GATEWAY_URL}"
echo "  auth      ${AUTH_URL}"
echo "  database  ${TARGET_DB}"
echo

# `e2e-dev` keeps its name and its NODE_ENV=development, so the filtered
# command a developer already has in their shell history still works; this
# wrapper only makes sure the contract is in the environment before it runs.
exec pnpm --filter @opencrvs/testland e2e-dev
