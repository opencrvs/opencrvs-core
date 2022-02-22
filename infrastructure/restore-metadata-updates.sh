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
else [ "$REPLICAS" = "5" ]; then
  HOST=rs0/mongo1,mongo2,mongo3,mongo4,mongo5
  NETWORK=opencrvs_overlay_net
  echo "Working with 5 replicas"
fi

echo
echo "Restoring metadata updates..."
echo
cd /tmp/compose/infrastructure/default_updates
for FILE in *.json
do
  NAMES=($(echo $FILE | tr "_" "\n"))
  DB=${NAMES[0]}
  COLLECTION=${NAMES[1]}
  echo "Updating collection: $COLLECTION of db: $DB"
  docker run --rm -v /tmp/compose/infrastructure/default_updates:/default_updates --network=$NETWORK mongo:3.6 bash \
 -c "mongoimport -h=$HOST -d=$DB -c=$COLLECTION --mode=upsert --file=/default_updates/$FILE"
done
