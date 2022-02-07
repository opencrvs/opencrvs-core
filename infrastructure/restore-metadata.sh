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

docker run --rm -v $DIR/default_backups:/default_backups --network=$NETWORK mongo:3.6 bash \
 -c "mongorestore --host $HOST --drop --gzip --archive=/default_backups/hearth-dev.gz"

docker run --rm -v $DIR/default_backups:/default_backups --network=$NETWORK mongo:3.6 bash \
 -c "mongorestore --host $HOST --drop --gzip --archive=/default_backups/openhim-dev.gz"

docker run --rm -v $DIR/default_backups:/default_backups --network=$NETWORK mongo:3.6 bash \
 -c "mongorestore --host $HOST --drop --gzip --archive=/default_backups/user-mgnt.gz"

docker run --rm -v $DIR/default_backups:/default_backups --network=$NETWORK mongo:3.6 bash \
 -c "mongorestore --host $HOST --drop --gzip --archive=/default_backups/application-config.gz"
