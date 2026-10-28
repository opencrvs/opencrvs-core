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

# Declarations for every public subpath, see rolldown.dts.config.mjs
npx rolldown -c rolldown.dts.config.mjs

# Build common events
npx esbuild src/events/index.ts --bundle --format=cjs --outdir=./dist/events --allow-overwrite --packages=external

# Build telemetry client
npx esbuild src/telemetry/index.ts --bundle --platform=node --format=cjs --outdir=./dist/telemetry --allow-overwrite --packages=external

# Build common conditionals
npx esbuild src/conditionals/index.ts --bundle --format=cjs --outdir=./dist/conditionals --allow-overwrite --packages=external

# Build common scopes
npx esbuild src/scopes/index.ts --bundle --format=cjs --outdir=./dist/scopes --allow-overwrite --packages=external

# Build common authentication
npx esbuild src/authentication/index.ts --bundle --format=cjs --outdir=./dist/authentication --allow-overwrite --packages=external

# Build api client
npx esbuild src/api/index.ts --bundle --format=cjs --outdir=./dist/api --allow-overwrite --packages=external

# Build deduplication api
npx esbuild src/events/deduplication.ts --bundle --format=cjs --outdir=./dist/events --allow-overwrite --packages=external

# Build common notifications
npx esbuild src/notification/index.ts --bundle --platform=node --format=cjs --outdir=./dist/notification --allow-overwrite --packages=external

# Build application config
npx esbuild src/application-config/index.ts --bundle --format=cjs --outdir=./dist/application-config --allow-overwrite --packages=external

# Build migration CLI
npx esbuild src/migrations/index.ts --bundle --platform=node --format=cjs --outdir=./dist/migrations --allow-overwrite --packages=external --banner:js="#!/usr/bin/env node"
chmod +x ./dist/migrations/index.js

# Build CLI
npx esbuild src/cli.ts --bundle --platform=node --format=cjs --outdir=./dist --allow-overwrite --packages=external --banner:js="#!/usr/bin/env node"
cp -R src/environment/templates dist/templates
chmod +x ./dist/cli.js

echo "Build completed successfully."
