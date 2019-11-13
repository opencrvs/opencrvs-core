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

DIR=$(pwd)

BACKUP_DIR=$DIR/backups

if [ "$DEV" = "true" ]; then
  HOST=mongo1
  NETWORK=opencrvs_default
  echo "Working in DEV mode"
else
  HOST=rs0/mongo1,mongo2,mongo3
  NETWORK=opencrvs_overlay_net
fi

BACKUP_DATE=$(date +%Y-%m-%d)

# Backup/Overwrite Hearth, OpenHIM & User database
docker run --rm -v BACKUP_DIR/mongo:/backups/mongo --network=$NETWORK mongo:3.6 bash \
 -c "mongodump --host $HOST -d hearth-dev --gzip --archive=/backups/mongo/hearth-dev-$BACKUP_DATE.gz"
docker run --rm -v BACKUP_DIR/mongo:/backups/mongo --network=$NETWORK mongo:3.6 bash \
 -c "mongodump --host $HOST -d openhim-dev --gzip --archive=/backups/mongo/openhim-dev-$BACKUP_DATE.gz"
docker run --rm -v BACKUP_DIR/mongo:/backups/mongo --network=$NETWORK mongo:3.6 bash \
 -c "mongodump --host $HOST -d user-mgnt --gzip --archive=/backups/mongo/user-mgnt-$BACKUP_DATE.gz"
# Backup/Overwrite Elasticsearch database
docker run --rm --network=$NETWORK appropriate/curl curl -XPUT -H "Content-Type: application/json;charset=UTF-8" 'http://elasticsearch:9200/_snapshot/ocrvs' -d '{ "type": "fs", "settings": { "location": "/backups/elasticsearch/", "compress": true }}'
docker run --rm --network=$NETWORK appropriate/curl curl -X DELETE "http://elasticsearch:9200/_snapshot/ocrvs/snapshot_$BACKUP_DATE"
docker run --rm --network=$NETWORK appropriate/curl curl -X PUT "http://elasticsearch:9200/_snapshot/ocrvs/snapshot_$BACKUP_DATE?wait_for_completion=true&pretty"
# Backup/Overwrite InfluxDB database
if [ -d "/backups/influxdb/$BACKUP_DATE" ]; then rm -Rf /backups/influxdb/$BACKUP_DATE; fi
# Get the container ID of any running InfluxDB container, as the only way to backup / restore is using the Influxd CLI
INFLUXDB_CONTAINER_ID=`echo $(docker service ps --no-trunc -f "desired-state=running" opencrvs_influxdb) | awk '{print $11}'`
INFLUXDB_CONTAINER_NAME=`echo $(docker service ps --no-trunc -f "desired-state=running" opencrvs_influxdb) | awk '{print $12}'`
INFLUXDB_HOSTNAME=`echo $(docker service ps -f "desired-state=running" opencrvs_influxdb) | awk '{print $14}'`
INFLUXDB_HOST=$(docker node inspect --format '{{.Status.Addr}}' "$HOSTNAME")
SSH_USER=${SSH_USER:-root}
OWN_IP=$(hostname -I | cut -d' ' -f1)
if [ $OWN_IP == $INFLUXDB_HOST ]; then
  docker exec $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID influxd backup -portable -database ocrvs /backups/influxdb/$BACKUP_DATE
else
  ssh $SSH_USER@$INFLUXDB_HOST 'docker exec $INFLUXDB_CONTAINER_NAME.$INFLUXDB_CONTAINER_ID influxd backup -portable -database ocrvs /backups/influxdb/$BACKUP_DATE'
fi

# Copy to off site server
#
# Command depends on the 'sshpass' utility, which is debian/ubuntu specific
# On other systems, ssh keys may be an option
$remote_user=""
$remote_pass=""
$remote_host=""
$remote_dir=""
sshpass -p "$remote_pass" scp BACKUP_DIR $remote_user@$remote_host:$remote_dir
echo "Copied backup files to remote server."

# Cleanup old backup files
#  - keep previous 7 days backups and the backup from the first of every month
find BACKUP_DIR -mtime +7 -exec rm {} \;


