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

SCRIPT_PATH=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# Revert hearth migrations
HEARTH_FILES=$(ls ./build/dist/src/migrations/hearth | wc -l)
for ((n=0;n<$HEARTH_FILES;n++)); do
  yarn --cwd $SCRIPT_PATH migrate-mongo down --file $HEARTH_CONFIG
done
yarn --cwd $SCRIPT_PATH migrate-mongo status --file $HEARTH_CONFIG

## Revert openhim migrations
OPENHIM_FILES=$(ls ./build/dist/src/migrations/openhim | wc -l)
for ((n=0;n<$OPENHIM_FILES;n++)); do
  yarn --cwd $SCRIPT_PATH migrate-mongo down --file $OPENHIM_CONFIG
done
yarn --cwd $SCRIPT_PATH migrate-mongo status --file $OPENHIM_CONFIG

## Revert application Config migration
APP_CONFIG_FILES=$(ls ./build/dist/src/migrations/application-config | wc -l)
for ((n=0;n<$APP_CONFIG_FILES;n++)); do
  yarn --cwd $SCRIPT_PATH migrate-mongo down --file $APP_CONFIG
done
yarn --cwd $SCRIPT_PATH migrate-mongo status --file $APP_CONFIG

## Revert user-mgnt migration
USER_MGNT_FILES=$(ls ./build/dist/src/migrations/user-mgnt | wc -l)
for ((n=0;n<$USER_MGNT_FILES;n++)); do
  yarn --cwd $SCRIPT_PATH migrate-mongo down --file $USER_MGNT_CONFIG
done
yarn --cwd $SCRIPT_PATH migrate-mongo status --file $USER_MGNT_CONFIG
