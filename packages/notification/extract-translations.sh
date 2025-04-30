# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

echo 'The Environment variable COUNTRY_CONFIG_PATH must be set in your Terminal, so we can check that your country configuration has all necessary translations.  If you cd into your country configuration repo and run the command pwd, then this will display for you.  Then run export COUNTRY_CONFIG_PATH=<your country config path> in this window and try to commit again please..  Currently:'
echo $COUNTRY_CONFIG_PATH

yarn run ts-node -- --compiler-options='{"module": "Node16"}' -r tsconfig-paths/register src/extract-translations.ts -- $COUNTRY_CONFIG_PATH
