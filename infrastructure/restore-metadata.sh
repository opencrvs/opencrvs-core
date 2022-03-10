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
    echo 'Usage: ./restore-metadata.sh REPLICAS ENV'
    exit 1
}

if [ -z "$1" ] ; then
    echo 'Error: Argument REPLICAS is required in position 1.'
    print_usage_and_exit
fi

if [ -z "$2" ] ; then
    echo 'Error: Argument ENV is required in position 2.'
    print_usage_and_exit
fi

REPLICAS=$1
ENV=$2

DIR=$(cd "$(dirname "$0")"; pwd)
echo "Working dir: $DIR"

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

if [[ "$ENV" != "qa" ]] ; then docker run --rm -v $DIR/default_backups:/default_backups --network=$NETWORK mongo:4.4 bash -c "mongorestore --host $HOST --drop --gzip --archive=/default_backups/hearth-dev.gz" ; fi

docker run --rm -v $DIR/default_backups:/default_backups --network=$NETWORK mongo:4.4 bash \
 -c "mongorestore --host $HOST --drop --gzip --archive=/default_backups/openhim-dev.gz"

if [[ "$ENV" != "qa" ]] ; then docker run --rm -v $DIR/default_backups:/default_backups --network=$NETWORK mongo:4.4 bash -c "mongorestore --host $HOST --drop --gzip --archive=/default_backups/user-mgnt.gz" ; fi

docker run --rm -v $DIR/default_backups:/default_backups --network=$NETWORK mongo:4.4 bash \
 -c "mongorestore --host $HOST --drop --gzip --archive=/default_backups/application-config.gz"
