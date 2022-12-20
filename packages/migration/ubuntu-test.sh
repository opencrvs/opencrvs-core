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
if [ "$1" != "" ]; then
  echo "$1migrate-mongo-config-hearth.js"
  echo "$1migrate-mongo-config-openhim.js"
  sed -i '' -e "s%migrationsDir: '%migrationsDir: '$1%" "$1migrate-mongo-config-hearth.js"
  sed -i '' -e "s%migrationsDir: '%migrationsDir: '$1%" "$1migrate-mongo-config-openhim.js"
fi
