
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

if [ "$REPLICAS" = "1" ]; then
  URI_HOST=mongo1:27017
elif [ "$REPLICAS" = "3" ]; then
  URI_HOST=mongo1:27017,mongo2:27017,mongo3:27017
elif [ "$REPLICAS" = "5" ]; then
  URI_HOST=mongo1:27017,mongo2:27017,mongo3:27017,mongo4:27017,mongo5:27017
else
  echo "Script must be passed an understandable number of replicas: 0,1,3 or 5"
  exit 1
fi

NETWORK=opencrvs_overlay_net
WAIT_TIMEOUT=240 WAIT_HOSTS=$URI_HOST /wait

mongo_credentials() {
  if [ ! -z ${MONGODB_ADMIN_USER+x} ] || [ ! -z ${MONGODB_ADMIN_PASSWORD+x} ]; then
    echo "--username $MONGODB_ADMIN_USER --password $MONGODB_ADMIN_PASSWORD --authenticationDatabase admin";
  else
    echo "";
  fi
}

mongoexport_credentials() {
  if [ ! -z ${MONGODB_ADMIN_USER+x} ] || [ ! -z ${MONGODB_ADMIN_PASSWORD+x} ]; then
    echo "mongodb://$MONGODB_ADMIN_USER:$MONGODB_ADMIN_PASSWORD@$URI_HOST/admin?replicaSet=rs0"
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

function checkIfUserExists {
  local user=$1
  local JSON="{\"user\": \"$user\"}"
  CREDENTIALS=$(mongoexport_credentials)
  CMD="docker run --rm --network=$NETWORK mongo:4.4 $CMD mongoexport --uri='"$CREDENTIALS"' --collection system.users --quiet --query='$JSON'"
  eval $CMD
}

# Rotate passwords to match the ones given to this script or create new users

CONFIG_USER=$(echo $(checkIfUserExists "config") | jq 'select(.user) | .user')
if [[ $CONFIG_USER != *"config"* ]]; then
  echo "config user not found"
  mongo <<EOF
  use application-config
  db.createUser({
    user: 'config',
    pwd: '$CONFIG_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'application-config' }]
  })
EOF
else
  echo "config user exists"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use application-config
  db.updateUser('config', {
    pwd: '$CONFIG_MONGODB_PASSWORD'
  })
EOF
fi

HEARTH_USER=$(echo $(checkIfUserExists "hearth") | jq 'select(.user) | .user')
if [[ $HEARTH_USER != *"hearth"* ]]; then
  echo "hearth user not found"
  mongo <<EOF
  use hearth-dev
  db.createUser({
    user: 'hearth',
    pwd: '$HEARTH_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'hearth' }, { role: 'readWrite', db: 'hearth-dev' }]
  })
EOF
else
  echo "hearth user exists"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use hearth-dev
  db.updateUser('hearth', {
    pwd: '$HEARTH_MONGODB_PASSWORD'
  })
EOF
fi

USER_MGNT_USER=$(echo $(checkIfUserExists "user-mgnt") | jq 'select(.user) | .user')
if [[ $USER_MGNT_USER != *"user-mgnt"* ]]; then
  echo "user-mgnt user not found"
  mongo <<EOF
  use user-mgnt
  db.createUser({
    user: 'user-mgnt',
    pwd: '$USER_MGNT_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'user-mgnt' }]
  })
EOF
else
  echo "user-mgnt user exists"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use user-mgnt
  db.updateUser('user-mgnt', {
    pwd: '$USER_MGNT_MONGODB_PASSWORD'
  })
EOF
fi

OPENHIM_USER=$(echo $(checkIfUserExists "openhim") | jq 'select(.user) | .user')
if [[ $OPENHIM_USER != *"openhim"* ]]; then
  echo "openhim user not found"
  mongo <<EOF
  use openhim-dev
  db.createUser({
    user: 'openhim',
    pwd: '$OPENHIM_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'openhim' }, { role: 'readWrite', db: 'openhim-dev' }]
  })
EOF
else
  echo "openhim user exists"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use openhim-dev
  db.updateUser('openhim', {
    pwd: '$OPENHIM_MONGODB_PASSWORD'
  })
EOF
fi

METRICS_USER=$(echo $(checkIfUserExists "metrics") | jq 'select(.user) | .user')
if [[ $METRICS_USER != *"metrics"* ]]; then
  echo "metrics user not found"
  mongo <<EOF
  use metrics
  db.createUser({
    user: 'metrics',
    pwd: '$METRICS_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'metrics' }]
  })
EOF
else
  echo "metrics user exists"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use metrics
  db.updateUser('metrics', {
    pwd: '$METRICS_MONGODB_PASSWORD'
  })
EOF
fi

WEBHOOKS_USER=$(echo $(checkIfUserExists "webhooks") | jq 'select(.user) | .user')
if [[ $WEBHOOKS_USER != *"webhooks"* ]]; then
  echo "webhooks user not found"
else
  echo "webhooks user exists"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use webhooks
  db.updateUser('webhooks', {
    pwd: '$WEBHOOKS_MONGODB_PASSWORD'
  })
EOF
fi
