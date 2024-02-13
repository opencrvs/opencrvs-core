#!/bin/sh
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

HEARTH_CONFIG=./build/dist/src/migrate-mongo-config-hearth.js
OPENHIM_CONFIG=./build/dist/src/migrate-mongo-config-openhim.js
APP_CONFIG=./build/dist/src/migrate-mongo-config-application-config.js
USER_MGNT_CONFIG=./build/dist/src/migrate-mongo-config-user-mgnt.js
PERFORMANCE_CONFIG=./build/dist/src/migrate-mongo-config-performance.js

SCRIPT_PATH=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# hearth migrations
yarn --cwd $SCRIPT_PATH migrate-mongo up --file $HEARTH_CONFIG
yarn --cwd $SCRIPT_PATH migrate-mongo status --file $HEARTH_CONFIG

#openhim migrations
yarn --cwd $SCRIPT_PATH migrate-mongo up --file $OPENHIM_CONFIG
yarn --cwd $SCRIPT_PATH migrate-mongo status --file $OPENHIM_CONFIG

# Application Config migration
yarn --cwd $SCRIPT_PATH migrate-mongo up --file $APP_CONFIG
yarn --cwd $SCRIPT_PATH migrate-mongo status --file $APP_CONFIG

# User mgnt migration
yarn --cwd $SCRIPT_PATH migrate-mongo up --file $USER_MGNT_CONFIG
yarn --cwd $SCRIPT_PATH migrate-mongo status --file $USER_MGNT_CONFIG

# performance migration
yarn --cwd $SCRIPT_PATH migrate-mongo up --file $PERFORMANCE_CONFIG
yarn --cwd $SCRIPT_PATH migrate-mongo status --file $PERFORMANCE_CONFIG
