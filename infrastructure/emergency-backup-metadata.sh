# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
# graphic logo are (registered/a) trademark(s) of Plan International.
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

DOW=$(date +"%a")

mkdir -p /backups/$DOW
chmod g+rwx /backups/$DOW

docker run --rm -v $DIR/backups:/backups --network=$NETWORK mongo:3.6 bash \
 -c "mongodump --host $HOST -d hearth-dev --gzip --archive=/backups/$DOW/hearth-dev.gz"

docker run --rm -v $DIR/backups:/backups --network=$NETWORK mongo:3.6 bash \
 -c "mongodump --host $HOST -d openhim-dev --gzip --archive=/backups/$DOW/openhim-dev.gz"

docker run --rm -v $DIR/backups:/backups --network=$NETWORK mongo:3.6 bash \
 -c "mongodump --host $HOST -d user-mgnt --gzip --archive=/backups/$DOW/user-mgnt.gz"

docker run --rm --network=$NETWORK appropriate/curl curl -X PUT "http://elasticsearch:9200/_snapshot/esbackup/snapshot_$DOW?wait_for_completion=true&pretty"
