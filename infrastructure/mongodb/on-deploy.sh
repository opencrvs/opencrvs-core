
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
# graphic logo are (registered/a) trademark(s) of Plan International.

# This file is run on each deployment with the sole purpose of updating
# passwords of MongoDB users to passwords given to this service as environment varibles

apt-get update
apt-get install curl

curl -L https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait --output /wait
chmod +x /wait

WAIT_TIMEOUT=240 WAIT_HOSTS=mongo1:27017,mongo2:27017,mongo3:27017 /wait

mongo_credentials() {
  if [ ! -z ${MONGODB_ADMIN_USER+x} ] || [ ! -z ${MONGODB_ADMIN_PASSWORD+x} ]; then
    echo "--username $MONGODB_ADMIN_USER --password $MONGODB_ADMIN_PASSWORD --authenticationDatabase admin";
  else
    echo "";
  fi
}

# Initialise replica sets
if [ "$REPLICAS" = "1" ]; then
  mongo $(mongo_credentials) --host mongo1 --eval "rs.initiate({_id:\"rs0\",members:[{_id:0,host:\"mongo1:27017\"}]})"
  HOST=rs0/mongo1
elif [ "$REPLICAS" = "3" ]; then
  mongo $(mongo_credentials) --host mongo1 --eval "rs.initiate({_id:\"rs0\",members:[{_id:0,host:\"mongo1:27017\"},{_id:1,host:\"mongo2:27017\"},{_id:2,host:\"mongo3:27017\"}]})"
  HOST=rs0/mongo1,mongo2,mongo3
elif [ "$REPLICAS" = "5" ]; then
  mongo $(mongo_credentials) --host mongo1 --eval "rs.initiate({_id:\"rs0\",members:[{_id:0,host:\"mongo1:27017\"},{_id:1,host:\"mongo2:27017\"},{_id:2,host:\"mongo3:27017\"},{_id:3,host:\"mongo4:27017\"},{_id:4,host:\"mongo5:27017\"}]})"
  HOST=rs0/mongo1,mongo2,mongo3,mongo4,mongo5
else
  echo "Script must be passed an understandable number of replicas: 0,1,3 or 5"
  exit 1
fi

# Rotate passwords to match the ones given to this script
mongo $(mongo_credentials) --host $HOST <<EOF
  use hearth-dev
  db.updateUser('hearth', {
    pwd: '$HEARTH_MONGODB_PASSWORD'
  })
EOF

mongo $(mongo_credentials) --host $HOST <<EOF
  use user-mgnt
  db.updateUser('user-mgnt', {
    pwd: '$USER_MGNT_MONGODB_PASSWORD'
  })
EOF

mongo $(mongo_credentials) --host $HOST <<EOF
  use openhim-dev
  db.updateUser('openhim', {
    pwd: '$OPENHIM_MONGODB_PASSWORD'
  })
EOF

mongo $(mongo_credentials) --host $HOST <<EOF
  use application-config
  db.updateUser('config', {
    pwd: '$CONFIG_MONGODB_PASSWORD'
  })
EOF

mongo $(mongo_credentials) --host $HOST <<EOF
  use webhooks
  db.updateUser('webhooks', {
    pwd: '$WEBHOOKS_MONGODB_PASSWORD'
  })
EOF