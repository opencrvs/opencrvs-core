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

# hearth migrations
yarn migrate-mongo up --file migrate-mongo-config-hearth.js
yarn migrate-mongo status --file migrate-mongo-config-hearth.js

#openhim migrations
yarn migrate-mongo up --file migrate-mongo-config-openhim.js
yarn migrate-mongo status --file migrate-mongo-config-openhim.js

#application-config migrations
yarn migrate-mongo up --file migrate-mongo-config-application-config.js
yarn migrate-mongo status --file migrate-mongo-config-application-config.js