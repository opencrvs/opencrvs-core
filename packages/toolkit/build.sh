# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

#!/bin/bash

set -e

rm -rf dist

npx tsc --build

# Build common events
npx esbuild src/events/index.ts --bundle --format=cjs --outdir=./dist/events --allow-overwrite --packages=external
mkdir -p ./dist/commons/events
cp -r ../commons/build/dist/common/events/*.d.ts ./dist/commons/events

# Build common conditionals
npx esbuild src/conditionals/index.ts --bundle --format=cjs --outdir=./dist/conditionals --allow-overwrite --packages=external
mkdir -p ./dist/commons/conditionals
cp -r ../commons/build/dist/common/conditionals/*.d.ts ./dist/commons/conditionals

# Build common scopes
npx esbuild src/scopes/index.ts --bundle --format=cjs --outdir=./dist/scopes --allow-overwrite --packages=external
cp -r ../commons/build/dist/common/scopes.d.ts ./dist/scopes/index.d.ts

# Build api client
npx esbuild src/api/index.ts --bundle --format=cjs --outdir=./dist/api --allow-overwrite --packages=external
mkdir -p ./dist/commons/api
cp -r ../events/build/types/router/router.d.ts ./dist/commons/api

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' 's|@opencrvs/events/build/types|../commons/api|g' dist/api/index.d.ts
  find dist -type f -exec sed -i '' 's|@opencrvs/commons|../commons|g' {} +
else
  sed -i 's|@opencrvs/events/build/types|../commons/api|g' dist/api/index.d.ts
  find dist -type f -exec sed -i 's|@opencrvs/commons|../commons|g' {} +
fi

echo "Build completed successfully."
