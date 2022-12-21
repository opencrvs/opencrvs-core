#!/bin/sh
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
# graphic logo are (registered/a) trademark(s) of Plan International.

updateFile() {
  local action=$1
  local path=$2
  local file=$3
  local sedPrefix=$4
  if [[ $action == *"RUN"* ]]; then
    eval $sedPrefix -e "s%migrations/%$path/migrations/%" "$file"
  else
    eval $sedPrefix -e "s%$path/migrations/%migrations/%" $file
  fi
}

if [  -n "$(uname -a | grep Ubuntu)" ]; then
  SED_PREFIX="sed -i "
elif [ "$(uname)" == "Darwin" ]; then
  SED_PREFIX="sed -i ''"
fi

HEARTH_CONFIG=$1/migrate-mongo-config-hearth.js
OPENHIM_CONFIG=$1/migrate-mongo-config-openhim.js
APP_CONFIG=$1/migrate-mongo-config-application-config.js
USER_MGNT_CONFIG=$1/migrate-mongo-config-user-mgnt.js


if [ "$1" != "" ]; then
  updateFile "RUN" $1 "$HEARTH_CONFIG" "$SED_PREFIX"
  updateFile "RUN" $1 "$OPENHIM_CONFIG" "$SED_PREFIX"
  updateFile "RUN" $1 "$APP_CONFIG" "$SED_PREFIX"
  updateFile "RUN" $1 "$USER_MGNT_CONFIG" "$SED_PREFIX"
fi

# Revert hearth migrations
HEARTH_FILES=$(ls $1/migrations/hearth | wc -l)
for ((n=0;n<$HEARTH_FILES;n++)); do
  yarn migrate-mongo down --file $HEARTH_CONFIG
done
yarn migrate-mongo status --file $HEARTH_CONFIG

## Revert openhim migrations
OPENHIM_FILES=$(ls $1/migrations/openhim | wc -l)
for ((n=0;n<$OPENHIM_FILES;n++)); do
  yarn migrate-mongo down --file $OPENHIM_CONFIG
done
yarn migrate-mongo status --file $OPENHIM_CONFIG

## Revert application Config migration
APP_CONFIG_FILES=$(ls $1/migrations/application-config | wc -l)
for ((n=0;n<$APP_CONFIG_FILES;n++)); do
  yarn migrate-mongo down --file $APP_CONFIG
done
yarn migrate-mongo status --file $APP_CONFIG

## Revert user-mgnt migration
USER_MGNT_FILES=$(ls $1/migrations/user-mgnt | wc -l)
for ((n=0;n<$USER_MGNT_FILES;n++)); do
  yarn migrate-mongo down --file $USER_MGNT_CONFIG
done
yarn migrate-mongo status --file $USER_MGNT_CONFIG

if [ "$1" != "" ]; then
  updateFile "REVERT" $1 "$HEARTH_CONFIG" "$SED_PREFIX"
  updateFile "REVERT" $1 "$OPENHIM_CONFIG" "$SED_PREFIX"
  updateFile "REVERT" $1 "$APP_CONFIG" "$SED_PREFIX"
  updateFile "REVERT" $1 "$USER_MGNT_CONFIG" "$SED_PREFIX"
fi
