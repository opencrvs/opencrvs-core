#!/bin/bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# Typecheck every package with the workspace TypeScript compiler
# (native TypeScript 7). typescript-eslint and the translation-extraction
# scripts keep the TypeScript 6 API via the @typescript/api alias until
# the TS 7.1 API lands — see development-environment/link-ts6-api.js.

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TSC7="$ROOT/node_modules/typescript/bin/tsc"

run() {
  local pkg="$1"
  shift
  echo "→ $pkg $*"
  (cd "$ROOT/packages/$pkg" && "$TSC7" "$@")
}

run commons -b tsconfig.build.json --force
run commons -b tsconfig.json --force
run components --noEmit
run toolkit -b --force
run events -p tsconfig.build.json --noEmit
run events -p tsconfig.router.json --noEmit
run events --noEmit
run auth --noEmit
run gateway --noEmit
run documents --noEmit
run data-seeder --noEmit
run migration --noEmit
run login --noEmit
run client -p tsconfig.json --noEmit
run client -p tsconfig.build.json --noEmit

echo "All packages typecheck clean on TypeScript 7 (native)."
