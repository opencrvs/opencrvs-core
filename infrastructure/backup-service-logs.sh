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
# By default OpenCRVS saves logs to the /opencrvs-logs/ folder on each node.  There is no way of knowing which
# log is saved on which node as Docker Swarm distributes the services across all nodes.
# This cron job runs once a week to sync service logs that exist on the node to Loggly.
#------------------------------------------------------------------------------------------------------------------
print_usage_and_exit () {
    echo 'Usage: ./backup-service-logs.sh LOGGLY_TOKEN LOGGLY_USERNAME LOGGLY_PASSWORD'
    echo "Script must receive loggly details."
    echo "7 days of log data will be saved in Loggly in a log file aliased with todays date"
    exit 1
}

if [ -z "$1" ] ; then
    echo "Error: Argument for the LOGGLY_TOKEN is required in position 1."
    print_usage_and_exit
fi
if [ -z "$2" ] ; then
    echo "Error: Argument for the LOGGLY_USERNAME is required in position 2."
    print_usage_and_exit
fi
if [ -z "$3" ] ; then
    echo "Error: Argument for the LOGGLY_PASSWORD is required in position 3."
    print_usage_and_exit
fi

# Host and directory where backups will be remotely saved
#--------------------------------------------------------
LOGGLY_TOKEN=$1
LOGGLY_USERNAME=$2
LOGGLY_PASSWORD=$3

# Log location
#-----------------------------------
FILES=/opencrvs-logs/*

# Today's date is used for aliases
#-----------------------------------
BACKUP_DATE=$(date +%Y-%m-%d)

for f in $FILES
do
  echo "Syncing $f file to Loggly with the following alias: $FILENAME-$BACKUP_DATE.log"
  FILENAME=${$f%.*}
  /bin/bash /configure-file-monitoring.sh -a opencrvs -t $1 -u $2 -p $1 -f $f -l $FILENAME-$BACKUP_DATE.log >> /var/log/loggly.log 2>&1
done