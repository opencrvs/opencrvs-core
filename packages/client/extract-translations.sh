# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
# graphic logo are (registered/a) trademark(s) of Plan International.

echo 'environment variable COUNTRY_CONFIG_PATH must be set.  Currently:'
echo $COUNTRY_CONFIG_PATH
echo 'environment variable COUNTRY_CODE must be set: ie: bgd, zmb.  Currently:'
echo $COUNTRY_CODE

ts-node --compiler-options='{"module": "commonjs"}' -r tsconfig-paths/register src/extract-translations.ts -- $COUNTRY_CONFIG_PATH $COUNTRY_CODE
