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
# This script clears all data and restores a specific day's data.  It is irreversable, so use with caution.

print_usage_and_exit () {
    echo 'Usage: ./emergency-restore-metadata.sh Mon|Tue|Wed|Thu|Fri|Sat|Sun'
    echo "Script must receive a day of the week parameter to restore data from that specific day"
    echo "The backup zips you would like to restore from: hearth-dev.gz, openhim-dev.gz and user-mgnt.gz must exist in /backups/<day of the week> folder"
    echo "The elasticsearch backup snapshot file named: snapshot_<day of the week> must exist in the /backups/elasticsearch folder"
    exit 1
}

if [ -z "$1" ] || { [ $1 != 'Mon' ] && [ $1 != 'Tue' ] && [ $1 != 'Wed' ] && [ $1 != 'Thu' ] && [ $1 != 'Fri' ] && [ $1 != 'Sat' ] && [ $1 != 'Sun' ] ;} ; then
    echo "Error: Argument for the day of the week is required in position 1.  You must select which day's data you would like to roll back to."
    print_usage_and_exit
fi
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

read -p "Are you sure? This will delete all user data and revert to $1's data." -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]
then
    # do dangerous stuff
    docker run --rm --network=$NETWORK mongo:3.6 mongo hearth-dev --host $HOST --eval "db.dropDatabase()"
    docker run --rm --network=$NETWORK mongo:3.6 mongo openhim-dev --host $HOST --eval "db.dropDatabase()"
    docker run --rm --network=$NETWORK mongo:3.6 mongo user-mgnt --host $HOST --eval "db.dropDatabase()"
    docker run --rm --network=$NETWORK appropriate/curl curl -XDELETE 'http://elasticsearch:9200/*' -v
    docker run --rm --network=$NETWORK appropriate/curl curl -X POST 'http://influxdb:8086/query?db=ocrvs' --data-urlencode "q=DROP SERIES FROM /.*/" -v
    docker run --rm -v $DIR/backups:/backups --network=$NETWORK mongo:3.6 bash \
     -c "mongorestore --host $HOST --drop --gzip --archive=/backups/$1/hearth-dev.gz"
    docker run --rm -v $DIR/backups:/backups --network=$NETWORK mongo:3.6 bash \
     -c "mongorestore --host $HOST --drop --gzip --archive=/backups/$1/openhim-dev.gz"
    docker run --rm -v $DIR/backups:/backups --network=$NETWORK mongo:3.6 bash \
     -c "mongorestore --host $HOST --drop --gzip --archive=/backups/$1/user-mgnt.gz"
    docker run --rm --network=$NETWORK appropriate/curl curl -X PUT "http://elasticsearch:9200/_snapshot/esbackup/snapshot_$1/_restore?pretty"
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
      docker exec -it $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID influxd restore -portable -database ocrvs /backups/influxdb
    else
      ssh $SSH_USER@$INFLUXDB_HOST 'docker exec -it $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID influxd restore -portable -database ocrvs /backups/influxdb'
    fi
fi

