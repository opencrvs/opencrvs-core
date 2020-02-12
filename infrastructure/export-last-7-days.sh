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
    echo 'Usage: ./export-last-7-days.sh HOST TOKEN'
    echo '  HOST   is the server where OpenCRVS is deployed to e.g. gateway.opencrvsbd.org'
    echo "  TOKEN  of system admin user (sysadmin scope required)"    
    exit 1
}

if [ -z "$1" ] ; then
    echo 'Error: Argument for HOST is required in position 1.'
    print_usage_and_exit
fi

if [ -z "$2" ] ; then
    echo 'Error: Argument TOKEN is required in postition 2.'
    print_usage_and_exit
fi

HOST=$1
TOKEN=$2

WEEK_AGO=$(date -v-1w +"%Y-%m-%dT%H:%M:%SZ")
TODAY=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

EXPORT_URL="http://$HOST/registrations/export?fromDate=$WEEK_AGO&toDate=$TODAY&token=Bearer%20$TOKEN"

curl $EXPORT_URL -fo export.zip

