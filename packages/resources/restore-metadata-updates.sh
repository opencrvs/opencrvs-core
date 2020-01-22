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
    echo 'Usage: ./restore-metadata-updates.sh bgd|zmb'
    echo "Script must receive a parameter of 'bgd' or 'zmb' set  as a supported alpha-3 country code e.g.: ./restore-metadata-updates.sh bgd"
    exit 1
}

if [ -z "$1" ] || { [ $1 != 'bgd' ] && [ $1 != 'zmb' ] ;} ; then
    echo 'Error: Argument for country is required in position 1.'
    print_usage_and_exit
fi

COUNTRY=$1
DIR=$(cd "$(dirname "$0")"; pwd)
echo "Working dir: $DIR"

if [ "$DEV" = "true" ]; then
  HOST=mongo1
  NETWORK=opencrvs_default
  echo "Working in DEV mode"
else
  HOST=rs0/mongo1,mongo2,mongo3
  NETWORK=opencrvs_overlay_net
fi

echo
echo "Restoring metadata updates..."
echo
cd $DIR/src/$COUNTRY/updates/jsons
for FILE in *.json
do  
  NAMES=($(echo $FILE | tr "_" "\n"))
  DB=${NAMES[0]]}
  COLLECTION=${NAMES[1]]}
  echo "Updating collection: $COLLECTION of db: $DB"  
  docker run --rm -v $DIR/src/$COUNTRY/updates/jsons:/src/$COUNTRY/updates/jsons --network=$NETWORK mongo:3.6 bash \
 -c "mongoimport -h=$HOST -d=$DB -c=$COLLECTION --mode=upsert --file=/src/$COUNTRY/updates/jsons/$FILE"
done  