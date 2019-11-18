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
#------------------------------------------------------------------------------------------------------------------

print_usage_and_exit () {
    echo 'Usage: ./emergency-backup-metadata.sh SSH_USER SSH_HOST REMOTE_DIR'
    echo "Script must receive SSH details and a target directory of a remote server to copy backup files to."
    echo "7 days of backup data will be retained in the manager node"
    exit 1
}

if [ -z "$1" ] ; then
    echo "Error: Argument for the SSH_USER is required in position 1."
    print_usage_and_exit
fi
if [ -z "$2" ] ; then
    echo "Error: Argument for the SSH_HOST is required in position 2."
    print_usage_and_exit
fi
if [ -z "$3" ] ; then
    echo "Error: Argument for the REMOTE_DIR is required in position 3."
    print_usage_and_exit
fi

# Host and directory where backups will be remotely saved
#--------------------------------------------------------
SSH_USER=$1
SSH_HOST=$2
REMOTE_DIR=$3

# Directory where backups will be locally saved for 7 days
#---------------------------------------------------------
DIR=$(pwd)
BACKUP_DIR=$DIR/backups

# Select docker network and replica set in production
#----------------------------------------------------
if [ "$DEV" = "true" ]; then
  HOST=mongo1
  NETWORK=opencrvs_default
  echo "Working in DEV mode"
else
  HOST=rs0/mongo1,mongo2,mongo3
  NETWORK=opencrvs_overlay_net
fi

# Today's date is used for filenames
#-----------------------------------
BACKUP_DATE=$(date +%Y-%m-%d)

# Backup Hearth, OpenHIM and any other service related Mongo databases into a mongo sub folder
#---------------------------------------------------------------------------------------------
docker run --rm -v $BACKUP_DIR/mongo:/backups/mongo --network=$NETWORK mongo:3.6 bash \
 -c "mongodump --host $HOST -d hearth-dev --gzip --archive=/backups/mongo/hearth-dev-$BACKUP_DATE.gz"
docker run --rm -v $BACKUP_DIR/mongo:/backups/mongo --network=$NETWORK mongo:3.6 bash \
 -c "mongodump --host $HOST -d openhim-dev --gzip --archive=/backups/mongo/openhim-dev-$BACKUP_DATE.gz"
docker run --rm -v $BACKUP_DIR/mongo:/backups/mongo --network=$NETWORK mongo:3.6 bash \
 -c "mongodump --host $HOST -d user-mgnt --gzip --archive=/backups/mongo/user-mgnt-$BACKUP_DATE.gz"

# Register backup folder as an Elasticsearch repository for backing up the search data
#-------------------------------------------------------------------------------------
docker run --rm --network=$NETWORK appropriate/curl curl -XPUT -H "Content-Type: application/json;charset=UTF-8" 'http://elasticsearch:9200/_snapshot/ocrvs' -d '{ "type": "fs", "settings": { "location": "$BACKUP_DIR/elasticsearch/", "compress": true }}'

# Backup Elasticsearch as a set of snapshot files into an elasticsearch sub folder
#---------------------------------------------------------------------------------
docker run --rm --network=$NETWORK appropriate/curl curl -X PUT "http://elasticsearch:9200/_snapshot/ocrvs/snapshot_$BACKUP_DATE?wait_for_completion=true&pretty"

# Get the container ID and host details of any running InfluxDB container, as the only way to backup is by using the Influxd CLI inside a running opencrvs_metrics container
#---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
INFLUXDB_CONTAINER_ID=`echo $(docker service ps --no-trunc -f "desired-state=running" opencrvs_influxdb) | awk '{print $11}'`
INFLUXDB_CONTAINER_NAME=`echo $(docker service ps --no-trunc -f "desired-state=running" opencrvs_influxdb) | awk '{print $12}'`
INFLUXDB_HOSTNAME=`echo $(docker service ps -f "desired-state=running" opencrvs_influxdb) | awk '{print $14}'`
INFLUXDB_HOST=$(docker node inspect --format '{{.Status.Addr}}' "$HOSTNAME")
INFLUXDB_SSH_USER=${INFLUXDB_SSH_USER:-root}

# If required, SSH into the node running the opencrvs_metrics container and backup the metrics data into an influxdb subfolder 
#-----------------------------------------------------------------------------------------------------------------------------
OWN_IP=$(hostname -I | cut -d' ' -f1)
if [ $OWN_IP == $INFLUXDB_HOST ]; then
  docker exec $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID influxd backup -portable -database ocrvs $BACKUP_DIR/influxdb/$BACKUP_DATE
else
  scp -r $BACKUP_DIR/influxdb $INFLUXDB_SSH_USER@$INFLUXDB_HOST:backups/influxdb
  ssh $INFLUXDB_SSH_USER@$INFLUXDB_HOST 'docker exec $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID influxd backup -portable -database ocrvs backups/influxdb/$BACKUP_DATE'
fi

# Copy the backups to an offsite server 
#--------------------------------------
scp $BACKUP_DIR $SSH_USER@$SSH_HOST:$REMOTE_DIR
echo "Copied backup files to remote server."

# Cleanup any old backups. Keep previous 7 days of data 
#------------------------------------------------------
find $BACKUP_DIR -mtime +7 -exec rm {} \;


