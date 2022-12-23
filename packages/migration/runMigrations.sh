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

if [ "$1" != "" ]; then
  HEARTH_CONFIG=$1/migrate-mongo-config-hearth.js
  OPENHIM_CONFIG=$1/migrate-mongo-config-openhim.js
  APP_CONFIG=$1/migrate-mongo-config-application-config.js
  USER_MGNT_CONFIG=$1/migrate-mongo-config-user-mgnt.js
else
  HEARTH_CONFIG=migrate-mongo-config-hearth.js
  OPENHIM_CONFIG=migrate-mongo-config-openhim.js
  APP_CONFIG=migrate-mongo-config-application-config.js
  USER_MGNT_CONFIG=migrate-mongo-config-user-mgnt.js
fi



if [ "$1" != "" ]; then
  updateFile "RUN" $1 "$HEARTH_CONFIG" "$SED_PREFIX"
  updateFile "RUN" $1 "$OPENHIM_CONFIG" "$SED_PREFIX"
  updateFile "RUN" $1 "$APP_CONFIG" "$SED_PREFIX"
  updateFile "RUN" $1 "$USER_MGNT_CONFIG" "$SED_PREFIX"
fi

# hearth migrations
yarn migrate-mongo up --file $HEARTH_CONFIG
yarn migrate-mongo status --file $HEARTH_CONFIG

#openhim migrations
yarn migrate-mongo up --file $OPENHIM_CONFIG
yarn migrate-mongo status --file $OPENHIM_CONFIG

# Application Config migration
yarn migrate-mongo up --file $APP_CONFIG
yarn migrate-mongo status --file $APP_CONFIG

# User mgnt migration
yarn migrate-mongo up --file $USER_MGNT_CONFIG
yarn migrate-mongo status --file $USER_MGNT_CONFIG

if [ "$1" != "" ]; then
  updateFile "REVERT" $1 "$HEARTH_CONFIG" "$SED_PREFIX"
  updateFile "REVERT" $1 "$OPENHIM_CONFIG" "$SED_PREFIX"
  updateFile "REVERT" $1 "$APP_CONFIG" "$SED_PREFIX"
  updateFile "REVERT" $1 "$USER_MGNT_CONFIG" "$SED_PREFIX"
fi
