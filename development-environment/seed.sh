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

print_usage_and_exit () {
  echo 'Usage: pnpm seed:dev [--env <name>]'
  echo
  echo "Seeds ONE environment's gateway and country config with users,"
  echo "locations and reference data. With no --env, that is the environment"
  echo "this git worktree owns. Run 'pnpm env:list' to see what exists."
  exit 1
}

DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.."; pwd)
cd "$DIR"

# Which environment's gateway and country config to seed. `packages/dev-cli`
# owns the port arithmetic; the seeder reads GATEWAY_URL / COUNTRY_CONFIG_URL
# straight out of the contract. See development-environment/environment.sh.
source "$DIR/development-environment/environment.sh"
opencrvs_env_load "$@" || print_usage_and_exit

echo
echo "Seeding environment ${OPENCRVS_ENV_NAME} (slot ${OPENCRVS_ENV_SLOT})"
echo "  gateway         ${GATEWAY_URL}"
echo "  country config  ${COUNTRY_CONFIG_URL}"
echo

pnpm exec lerna run seed --stream --scope @opencrvs/data-seeder
