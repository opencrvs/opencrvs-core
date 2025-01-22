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
cp -r ../commons/build/dist/common/events/*.d.ts ./dist/events

# Build common scopes
npx esbuild src/scopes/index.ts --bundle --format=cjs --outdir=./dist/scopes --allow-overwrite --packages=external
cp -r ../commons/build/dist/common/scopes.d.ts ./dist/scopes/index.d.ts

# Build common conditionals
npx esbuild src/conditionals/index.ts --bundle --format=cjs --outdir=./dist/conditionals --allow-overwrite --packages=external
cp -r ../commons/build/dist/common/conditionals/*.d.ts ./dist/conditionals

# Build api client
npx esbuild src/api/index.ts --bundle --format=cjs --outdir=./dist/api --allow-overwrite --packages=external
cp -r ../events/build/types/router/router.d.ts ./dist/api
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' 's|@opencrvs/events/build/types|.|g' dist/api/index.d.ts
else
  sed -i 's|@opencrvs/events/build/types|.|g' dist/api/index.d.ts
fi

echo "Build completed successfully."
