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
    echo 'Usage: ./emergency-restore-metadata.sh date e.g. 2019-01-01'
    echo "Script must receive a date parameter to restore data from that specific day"
    echo "The Hearth, OpenHIM and User db backup zips you would like to restore from: hearth-dev-{date}.gz, openhim-dev-{date}.gz and user-mgnt-{date}.gz must exist in /backups/mongo/{date} folder"
    echo "The Elasticsearch backup snapshot file named: snapshot_{date} must exist in the /backups/elasticsearch folder"
    echo "The InfluxDB backup files must exist in the /backups/influxdb/{date} folder"
    exit 1
}

if [ -z "$1" ] ; then
    echo "Error: Argument for the date is required in position 1.  You must select which day's data you would like to roll back to."
    print_usage_and_exit
fi

function ask_yes_or_no() {
    read -p "$1 ([y]es or [N]o): "
    case $(echo $REPLY | tr '[A-Z]' '[a-z]') in
        y|yes) echo "yes" ;;
        *)     echo "no" ;;
    esac
}
if [[ "no" == $(ask_yes_or_no "Are you sure?") || \
      "no" == $(ask_yes_or_no "Are you *really* sure?") ]]
then
    echo "Skipped."
    exit 0
fi

DIR=$(pwd)
echo "Working dir: $DIR"

if [ "$DEV" = "true" ]; then
  HOST=mongo1
  NETWORK=opencrvs_default
  echo "Working in DEV mode"
else
  HOST=rs0/mongo1,mongo2,mongo3
  NETWORK=opencrvs_overlay_net
fi


docker run --rm --network=$NETWORK mongo:3.6 mongo hearth-dev --host $HOST --eval "db.dropDatabase()"
docker run --rm --network=$NETWORK mongo:3.6 mongo openhim-dev --host $HOST --eval "db.dropDatabase()"
docker run --rm --network=$NETWORK mongo:3.6 mongo user-mgnt --host $HOST --eval "db.dropDatabase()"
docker run --rm --network=$NETWORK appropriate/curl curl -XDELETE 'http://elasticsearch:9200/*' -v
docker run --rm --network=$NETWORK appropriate/curl curl -X POST 'http://influxdb:8086/query?db=ocrvs' --data-urlencode "q=DROP SERIES FROM /.*/" -v
docker run --rm --network=$NETWORK appropriate/curl curl -X POST 'http://influxdb:8086/query?db=ocrvs' --data-urlencode "q=DROP DATABASE \"ocrvs\"" -v
# Restore Hearth, OpenHIM and User db from backup
docker run --rm -v $DIR/backups/mongo/$1:/backups/mongo/$1 --network=$NETWORK mongo:3.6 bash \
 -c "mongorestore --host $HOST --drop --gzip --archive=/backups/mongo/$1/hearth-dev.gz"
docker run --rm -v $DIR/backups/mongo/$1:/backups/mongo/$1 --network=$NETWORK mongo:3.6 bash \
 -c "mongorestore --host $HOST --drop --gzip --archive=/backups/mongo/$1/openhim-dev.gz"
docker run --rm -v $DIR/backups/mongo/$1:/backups/mongo/$1 --network=$NETWORK mongo:3.6 bash \
 -c "mongorestore --host $HOST --drop --gzip --archive=/backups/mongo/$1/user-mgnt.gz"
# Restore Elasticsearch from backup
docker run --rm --network=$NETWORK appropriate/curl curl -X POST "http://elasticsearch:9200/_snapshot/ocrvs/snapshot_$1/_restore?pretty"
# Restore InfluxDb from backup
INFLUXDB_CONTAINER_ID=`echo $(docker service ps --no-trunc -f "desired-state=running" opencrvs_influxdb) | awk '{print $11}'`
INFLUXDB_CONTAINER_NAME=`echo $(docker service ps --no-trunc -f "desired-state=running" opencrvs_influxdb) | awk '{print $12}'`
INFLUXDB_HOSTNAME=`echo $(docker service ps -f "desired-state=running" opencrvs_influxdb) | awk '{print $14}'`
INFLUXDB_HOST=$(docker node inspect --format '{{.Status.Addr}}' "$HOSTNAME")
SSH_USER=${SSH_USER:-root}
OWN_IP=$(hostname -I | cut -d' ' -f1)
if [ $OWN_IP == $INFLUXDB_HOST ]; then
  docker exec -it $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID influxd restore -portable -db ocrvs /backups/influxdb/$DOW
else
  ssh $SSH_USER@$INFLUXDB_HOST 'docker exec -it $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID influxd restore -portable -db ocrvs /backups/influxdb/$DOW'
fi
