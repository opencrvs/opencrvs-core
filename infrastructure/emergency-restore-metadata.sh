# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
# graphic logo are (registered/a) trademark(s) of Plan International.

#------------------------------------------------------------------------------------------------------------------
# By default OpenCRVS saves a backup of all data on a cron job every day in case of an emergency data loss incident
# This script clears all data and restores a specific day's data.  It is irreversable, so use with caution.
#------------------------------------------------------------------------------------------------------------------

print_usage_and_exit () {
    echo 'Usage: ./emergency-restore-metadata.sh date e.g. 2019-01-01 3'
    echo "This script CLEARS ALL DATA and RESTORES'S A SPECIFIC DAY'S DATA.  This process is irreversable, so USE WITH CAUTION."
    echo "Script must receive a date parameter to restore data from that specific day in format +%Y-%m-%d"
    echo "The Hearth, OpenHIM User and Application-config db backup zips you would like to restore from: hearth-dev-{date}.gz, openhim-dev-{date}.gz, user-mgnt-{date}.gz and  application-config-{date}.gz must exist in /data/backups/mongo/{date} folder"
    echo "The Elasticsearch backup folder /data/backups/elasticsearch must exist with all previous snapshots and indices. All files are required"
    echo "The InfluxDB backup files must exist in the /data/backups/influxdb/{date} folder"
    echo "The InfluxDB backup files must exist in the /data/backups/influxdb/{date} folder"
    echo ""
    echo "If your MongoDB is password protected, an admin user's credentials can be given as environment variables:"
    echo "MONGODB_ADMIN_USER=your_user MONGODB_ADMIN_PASSWORD=your_pass"
    exit 1
}

if [ -z "$1" ] ; then
    echo "Error: Argument for the date is required in position 1.  You must select which day's data you would like to roll back to."
    print_usage_and_exit
fi

if [ -z "$2" ] ; then
    echo "Error: Argument for the REPLICAS is required in position 2."
    print_usage_and_exit
fi


REPLICAS=$2

# Retrieve 2-step verification to continue
#-----------------------------------------
function ask_yes_or_no() {
    read -p "$1 ([y]es or [N]o): "
    case $(echo $REPLY | tr '[A-Z]' '[a-z]') in
        y|yes) echo "yes" ;;
        *)     echo "no" ;;
    esac
}
if [[ "no" == $(ask_yes_or_no "This script will clear all data from OpenCRVS and restore from a backup. Are you sure you are logged in as a root user?  ") || \
      "no" == $(ask_yes_or_no "Are you *really* sure?  Have you tested these backup files in a restore process on a development environment first?") ]]
then
    echo "Skipped."
    exit 0
fi

# Select docker network and replica set in production
#----------------------------------------------------
if [ "$REPLICAS" = "0" ]; then
  HOST=mongo1
  NETWORK=opencrvs_default
  echo "Working with no replicas"
elif [ "$REPLICAS" = "1" ]; then
  HOST=rs0/mongo1
  NETWORK=opencrvs_overlay_net
  echo "Working with 1 replica"
elif [ "$REPLICAS" = "3" ]; then
  HOST=rs0/mongo1,mongo2,mongo3
  NETWORK=opencrvs_overlay_net
  echo "Working with 3 replicas"
elif [ "$REPLICAS" = "5" ]; then
  HOST=rs0/mongo1,mongo2,mongo3,mongo4,mongo5
  NETWORK=opencrvs_overlay_net
  echo "Working with 5 replicas"
else
  echo "Script must be passed an understandable number of replicas: 0,1,3 or 5"
  exit 1
fi

mongo_credentials() {
  if [ ! -z ${MONGODB_ADMIN_USER+x} ] || [ ! -z ${MONGODB_ADMIN_PASSWORD+x} ]; then
    echo "--username $MONGODB_ADMIN_USER --password $MONGODB_ADMIN_PASSWORD --authenticationDatabase admin";
  else
    echo "";
  fi
}

# Delete all data from Hearth, OpenHIM, User and Application-config and any other service related Mongo databases
#-----------------------------------------------------------------------------------
docker run --rm --network=$NETWORK mongo:4.4 mongo hearth-dev $(mongo_credentials) --host $HOST --eval "db.dropDatabase()"
docker run --rm --network=$NETWORK mongo:4.4 mongo openhim-dev $(mongo_credentials) --host $HOST --eval "db.dropDatabase()"
docker run --rm --network=$NETWORK mongo:4.4 mongo user-mgnt $(mongo_credentials) --host $HOST --eval "db.dropDatabase()"
docker run --rm --network=$NETWORK mongo:4.4 mongo application-config $(mongo_credentials) --host $HOST --eval "db.dropDatabase()"

# Delete all data from search
#----------------------------
docker run --rm --network=$NETWORK appropriate/curl curl -XDELETE 'http://elasticsearch:9200/*' -v

# Delete all data from metrics
#-----------------------------
docker run --rm --network=$NETWORK appropriate/curl curl -X POST 'http://influxdb:8086/query?db=ocrvs' --data-urlencode "q=DROP SERIES FROM /.*/" -v
docker run --rm --network=$NETWORK appropriate/curl curl -X POST 'http://influxdb:8086/query?db=ocrvs' --data-urlencode "q=DROP DATABASE \"ocrvs\"" -v

# Restore all data from a backup into Hearth, OpenHIM, User, Application-config and any other service related Mongo databases
#--------------------------------------------------------------------------------------------------
docker run --rm -v /data/backups/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash \
 -c "mongorestore --host $HOST --drop --gzip --archive=/data/backups/mongo/hearth-dev-$1.gz"
docker run --rm -v /data/backups/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash \
 -c "mongorestore --host $HOST --drop --gzip --archive=/data/backups/mongo/openhim-dev-$1.gz"
docker run --rm -v /data/backups/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash \
 -c "mongorestore --host $HOST --drop --gzip --archive=/data/backups/mongo/user-mgnt-$1.gz"
docker run --rm -v /data/backups/mongo:/data/backups/mongo --network=$NETWORK mongo:4.4 bash \
 -c "mongorestore --host $HOST --drop --gzip --archive=/data/backups/mongo/application-config-$1.gz"

# Restore all data from a backup into search
#-------------------------------------------
docker run --rm --network=$NETWORK appropriate/curl curl -X POST "http://elasticsearch:9200/_snapshot/ocrvs/snapshot_$1/_restore?pretty"

# Get the container ID and host details of any running InfluxDB container, as the only way to restore is by using the Influxd CLI inside a running opencrvs_metrics container
#----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
INFLUXDB_CONTAINER_ID=`echo $(docker service ps --no-trunc -f "desired-state=running" opencrvs_influxdb) | awk '{print $11}'`
INFLUXDB_CONTAINER_NAME=`echo $(docker service ps --no-trunc -f "desired-state=running" opencrvs_influxdb) | awk '{print $12}'`
INFLUXDB_HOSTNAME=`echo $(docker service ps -f "desired-state=running" opencrvs_influxdb) | awk '{print $14}'`
INFLUXDB_HOST=$(docker node inspect --format '{{.Status.Addr}}' "$HOSTNAME")
INFLUXDB_SSH_USER=${INFLUXDB_SSH_USER:-root}

# If required, SSH into the node running the opencrvs_metrics container and restore the metrics data from an influxdb subfolder
#------------------------------------------------------------------------------------------------------------------------------
OWN_IP=`echo $(hostname -I | cut -d' ' -f1)`
if [[ "$OWN_IP" = "$INFLUXDB_HOST" ]]; then
  docker cp /data/backups/influxdb/$1 $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID:/data/backups/influxdb/$1
  docker exec $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID influxd restore -portable -db ocrvs /data/backups/influxdb/$1
else
  scp -r /data/backups/influxdb $INFLUXDB_SSH_USER@$INFLUXDB_HOST:/data/backups/influxdb
  ssh $INFLUXDB_SSH_USER@$INFLUXDB_HOST "docker cp /data/backups/influxdb/$1 $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID:/data/backups/influxdb/$1 && docker exec $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID influxd restore -portable -db ocrvs /data/backups/influxdb/$1"
fi
