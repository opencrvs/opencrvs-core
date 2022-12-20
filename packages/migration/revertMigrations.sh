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

function updateFile {
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
  updateFile "RUN" $1 "$1/migrate-mongo-config-hearth.js" "$SED_PREFIX"
  updateFile "RUN" $1 "$1/migrate-mongo-config-openhim.js" "$SED_PREFIX"
  updateFile "RUN" $1 "$1/migrate-mongo-config-application-config.js" "$SED_PREFIX"
  updateFile "RUN" $1 "$1/migrate-mongo-config-user-mgnt.js" "$SED_PREFIX"
fi

# Revert hearth migrations
HEARTH_FILES=$(ls $1migrations/hearth | wc -l)
for ((n=0;n<$HEARTH_FILES;n++)); do
  yarn migrate-mongo down --file $1migrate-mongo-config-hearth.js
done
yarn migrate-mongo status --file $1migrate-mongo-config-hearth.js

## Revert openhim migrations
OPENHIM_FILES=$(ls $1migrations/openhim | wc -l)
for ((n=0;n<$OPENHIM_FILES;n++)); do
  yarn migrate-mongo down --file $1migrate-mongo-config-openhim.js
done
yarn migrate-mongo status --file $1migrate-mongo-config-openhim.js

## Revert application Config migration
APP_CONFIG_FILES=$(ls $1migrations/application-config | wc -l)
for ((n=0;n<$APP_CONFIG_FILES;n++)); do
  yarn migrate-mongo down --file $1migrate-mongo-config-application-config.js
done
yarn migrate-mongo status --file $1migrate-mongo-config-application-config.js

## Revert user-mgnt migration
USER_MGNT_FILES=$(ls $1migrations/user-mgnt | wc -l)
for ((n=0;n<$USER_MGNT_FILES;n++)); do
  yarn migrate-mongo down --file $1migrate-mongo-config-user-mgnt.js
done
yarn migrate-mongo status --file $1migrate-mongo-config-user-mgnt.js

if [ "$1" != "" ]; then
  updateFile "REVERT" $1 "$1/migrate-mongo-config-hearth.js" "$SED_PREFIX"
  updateFile "REVERT" $1 "$1/migrate-mongo-config-openhim.js" "$SED_PREFIX"
  updateFile "REVERT" $1 "$1/migrate-mongo-config-application-config.js" "$SED_PREFIX"
  updateFile "REVERT" $1 "$1/migrate-mongo-config-user-mgnt.js" "$SED_PREFIX"
fi
