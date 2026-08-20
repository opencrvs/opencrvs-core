#!/bin/bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

set -e

rm -rf dist

# tsconfig.build.json excludes the test files, which dist publishes otherwise.
npx tsc --build tsconfig.build.json

# Build common events
npx esbuild src/events/index.ts --bundle --format=cjs --outdir=./dist/events --allow-overwrite --packages=external

# Build telemetry client (self-contained; .d.ts comes from tsc --build above)
npx esbuild src/telemetry/index.ts --bundle --format=cjs --outdir=./dist/telemetry --allow-overwrite --packages=external
mkdir -p ./dist/commons/events
cp -r ../commons/build/dist/common/events/*.d.ts ./dist/commons/events
mkdir -p ./dist/commons/events/state
cp -r ../commons/build/dist/common/events/state/*.d.ts ./dist/commons/events/state

# Build common conditionals
npx esbuild src/conditionals/index.ts --bundle --format=cjs --outdir=./dist/conditionals --allow-overwrite --packages=external
mkdir -p ./dist/commons/conditionals
cp -r ../commons/build/dist/common/conditionals/*.d.ts ./dist/commons/conditionals

# Build common scopes
npx esbuild src/scopes/index.ts --bundle --format=cjs --outdir=./dist/scopes --allow-overwrite --packages=external
cp -r ../commons/build/dist/common/scopes.d.ts ./dist/scopes/index.d.ts

# Build common authentication
npx esbuild src/authentication/index.ts --bundle --format=cjs --outdir=./dist/authentication --allow-overwrite --packages=external
cp -r ../commons/build/dist/common/authentication.d.ts ./dist/authentication/index.d.ts

# Build api client
npx esbuild src/api/index.ts --bundle --format=cjs --outdir=./dist/api --allow-overwrite --packages=external
mkdir -p ./dist/commons/api
cp -r ../events/build/types/router/router.d.ts ./dist/commons/api

# Build deduplication api
npx esbuild src/events/deduplication.ts --bundle --format=cjs --outdir=./dist/events --allow-overwrite --packages=external
cp -r ../commons/build/dist/common/events/deduplication.d.ts ./dist/events/deduplication.d.ts

# Build common notifications
npx esbuild src/notification/index.ts --bundle --format=cjs --outdir=./dist/notification --allow-overwrite --packages=external
mkdir -p ./dist/commons/notification
cp -r ../commons/build/dist/common/notification/*.d.ts ./dist/commons/notification

# Build application config
npx esbuild src/application-config/index.ts --bundle --format=cjs --outdir=./dist/application-config --allow-overwrite --packages=external
mkdir -p ./dist/commons/application-config
cp -r ../commons/build/dist/common/application-config.d.ts ./dist/commons/application-config/index.d.ts

# Build migration CLI
npx esbuild src/migrations/v2.1/index.ts --bundle --format=cjs --outdir=./dist/migrations/v2.1 --allow-overwrite --packages=external --banner:js="#!/usr/bin/env node"
chmod +x ./dist/migrations/v2.1/index.js

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' 's|@opencrvs/events/build/types|../commons/api|g' dist/api/index.d.ts
  find dist -type f -exec sed -i '' 's|@opencrvs/commons|../commons|g' {} +
else
  sed -i 's|@opencrvs/events/build/types|../commons/api|g' dist/api/index.d.ts
  find dist -type f -exec sed -i 's|@opencrvs/commons|../commons|g' {} +
fi

# Build CLI
npx esbuild src/cli.ts --bundle --format=cjs --outdir=./dist --allow-overwrite --packages=external --banner:js="#!/usr/bin/env node"
cp -R src/environment/templates dist/templates
chmod +x ./dist/cli.js

echo "Build completed successfully."
