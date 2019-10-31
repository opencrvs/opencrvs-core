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
    echo 'Usage: ./restore-metadata.sh --country=bgd|zmb'
    echo "  --country must have a value of 'bgd' or 'zmb' set  as a supported alpha-3 country code e.g. --country=bgd"
    exit 1
}

if [ -z "$1" ] || { [ $1 != '--country=bgd' ] && [ $1 != '--country=zmb' ] ;} ; then
    echo 'Error: Argument --country is required in postition 1.'
    print_usage_and_exit
fi

DIR=$(cd "$(dirname "$0")"; pwd)
echo "Working dir: $DIR"