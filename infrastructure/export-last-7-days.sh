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
    echo 'Usage: ./export-last-7-days.sh HOST USERNAME PASSWORD'
    echo '  HOST      is the server where OpenCRVS is deployed to e.g. opencrvs.qa1.jembi.org'
    echo "  USERNAME  username of an API user (api scope required)"
    echo "  PASSWORD  password of the user"
    exit 1
}

if [ -z "$1" ] ; then
    echo 'Error: Argument for HOST is required in position 1.'
    print_usage_and_exit
fi

if [ -z "$2" ] ; then
    echo 'Error: Argument USERNAME is required in postition 2.'
    print_usage_and_exit
fi

if [ -z "$3" ] ; then
    echo 'Error: Argument PASSWORD is required in postition 2.'
    print_usage_and_exit
fi


HOST=$1
USERNAME=$2
PASSWORD=$3

WEEK_AGO=$(date -v-1w +"%Y-%m-%dT%H:%M:%SZ")
TODAY=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

AUTHENTICATE_URL=http://localhost:4040/authenticate
TOKEN=$(curl -d "username=$USERNAME&password=$PASSWORD" -X POST $AUTHENTICATE_URL | docker run --rm -i imega/jq -r '.token')

EXPORT_URL="http://localhost:7070/registrations/export?fromDate=$WEEK_AGO&toDate=$TODAY&token=Bearer%20$TOKEN"

curl $EXPORT_URL -fo export.zip

