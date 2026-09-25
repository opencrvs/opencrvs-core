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
  echo 'Usage: pnpm open [--env <name>]'
  echo
  echo "Opens ONE environment's client in a browser. With no --env, that is"
  echo "the environment this git worktree owns. Run 'pnpm env:list' to see"
  echo "which environments exist."
  exit 1
}

DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.."; pwd)
cd "$DIR"

# `packages/dev-cli` owns the port arithmetic; this script only reads the
# resulting URL. See development-environment/environment.sh.
source "$DIR/development-environment/environment.sh"
opencrvs_env_load "$@" || print_usage_and_exit

# The client only. Login is reached through the client's own same-origin
# `/login` redirect (the vite `loginRedirectPlugin`), and storybook no longer
# runs as part of the dev stack — see docs/adr/0004-storybook-api-docs-and-
# bootstrap-leave-the-dev-stack.md.
echo "Opening environment ${OPENCRVS_ENV_NAME} (slot ${OPENCRVS_ENV_SLOT})"
echo "  client  ${CLIENT_APP_URL}"

if command -v opener >/dev/null 2>&1; then
  opener "${CLIENT_APP_URL}"
else
  echo
  echo "No 'opener' on PATH — run this through 'pnpm open', or browse to the URL above."
fi
