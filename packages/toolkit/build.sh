#!/bin/bash

set -e

rm -rf dist

npx tsc --build

# Build common events
npx esbuild src/events/index.ts --bundle --format=cjs --outdir=./dist/events --allow-overwrite --packages=external
cp -r ../commons/build/dist/common/events/*.d.ts ./dist/events

# Build common conditionals
npx esbuild src/conditionals/index.ts --bundle --format=cjs --outdir=./dist/conditionals --allow-overwrite --packages=external
cp -r ../commons/build/dist/common/conditionals/*.d.ts ./dist/conditionals

# Build api client
npx esbuild src/api/index.ts --bundle --format=cjs --outdir=./dist/api --allow-overwrite --packages=external
cp -r ../events/build/types/router/router.d.ts ./dist/api
sed -i '' 's|@opencrvs/events/build/types|.|g' dist/api/index.d.ts

echo "Build completed successfully."