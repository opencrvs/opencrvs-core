# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
# graphic logo are (registered/a) trademark(s) of Plan International.
set -e

print_usage_and_exit () {
    echo 'Usage: ./dev.sh LANGUAGES'
    echo "LANGUAGES must have a value of either 'bn,en' or 'en'"
    exit 1
}

if [ -z "$1" ] || { [ $1 != 'bn,en' ] && [ $1 != 'en' ] ;} ; then
    echo 'Error: Argument LANGUAGES is required in position 1.'
    print_usage_and_exit
fi
export LANGUAGES=$1
yarn dev:secrets:gen && concurrently "yarn run start" "yarn run compose:deps"