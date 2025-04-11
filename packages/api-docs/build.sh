# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
set -e

rm -rf build
mkdir -p build

WORK_DIR="$(dirname "$(realpath "$0")")"

# Build OpenAPI docs for Events service
EVENTS_YML="$(mktemp -u).yml"
(cd $WORK_DIR/../events && NODE_ENV=develop npx tsx src/openapi.ts) > $EVENTS_YML

# Build OpenAPI docs for country config
COUNTRYCONFIG_YML="$(mktemp -u).yml"
(cd $WORK_DIR/../commons && npx tsx src/countryconfig/openapi.ts) > $COUNTRYCONFIG_YML

echo $EVENTS_YML
echo $COUNTRYCONFIG_YML

# Join docs
JOINED_YML="$(mktemp -u).yml"
echo "Joining OpenAPI YAML files"
LOG_LEVEL=debug npx @redocly/cli join $EVENTS_YML $COUNTRYCONFIG_YML -o $JOINED_YML

echo "Building OpenAPI docs"
# Build docs
npx @redocly/cli build-docs $JOINED_YML -o build/index.html
