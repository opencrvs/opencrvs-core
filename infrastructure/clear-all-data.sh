# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
# graphic logo are (registered/a) trademark(s) of Plan International.
if [ "$DEV" = "true" ]; then
  HOST=mongo1
  NETWORK=opencrvs_default
  echo "Working in DEV mode"
else
  HOST=rs0/mongo1,mongo2,mongo3
  NETWORK=opencrvs_overlay_net
fi

# Delete all data from mongo
#---------------------------
docker run --rm --network=$NETWORK mongo:3.6 mongo hearth-dev --host $HOST --eval "db.dropDatabase()"

docker run --rm --network=$NETWORK mongo:3.6 mongo openhim-dev --host $HOST --eval "db.dropDatabase()"

docker run --rm --network=$NETWORK mongo:3.6 mongo user-mgnt --host $HOST --eval "db.dropDatabase()"

docker run --rm --network=$NETWORK mongo:3.6 mongo application-config --host $HOST --eval "db.dropDatabase()"

# Delete all data from elasticsearch
#-----------------------------------
docker run --rm --network=$NETWORK appropriate/curl curl -XDELETE 'http://elasticsearch:9200/*' -v

# Delete all data from metrics
#-----------------------------
docker run --rm --network=$NETWORK appropriate/curl curl -X POST 'http://influxdb:8086/query?db=ocrvs' --data-urlencode "q=DROP SERIES FROM /.*/" -v
