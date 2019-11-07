# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
# graphic logo are (registered/a) trademark(s) of Plan International.

# By default OpenCRVS saves a backup of all data on a cron job every day in case of an emergency data loss incident
# Every seven days the backups are overwritten to save harddisk space.  

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

# get id and name of any running influxdb container
INFLUXDB_CONTAINER_ID=$(docker service ps --no-trunc -f "desired-state=running" opencrvs_influxdb) | awk '{print $11}'
INFLUXDB_CONTAINER_NAME=$(docker service ps --no-trunc -f "desired-state=running" opencrvs_influxdb) | awk '{print $12}'
# get ip of any node containing any running influxdb container
INFLUXDB_HOSTNAME=$(docker service ps -f "desired-state=running" opencrvs_influxdb) | awk '{print $14}'
INFLUXDB_HOST=$(docker node inspect --format '{{.Status.Addr}}' "$HOSTNAME")
SSH_USER=${SSH_USER:-root}
# backup influxdb
OWN_IP=$(hostname -I | cut -d' ' -f1)
if [ $OWN_IP == $INFLUXDB_HOST ]; then
  docker exec -it $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID influxd backup -portable -database ocrvs /backups/influxdb
else
  ssh $SSH_USER@$INFLUXDB_HOST 'docker exec -it $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID influxd backup -portable -database ocrvs /backups/influxdb'
fi
