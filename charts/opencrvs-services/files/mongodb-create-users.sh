#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# This file is run on each deployment with the sole purpose of updating
# passwords of MongoDB users to passwords given to this service as environment variables

[ -z "$MONGODB_HOSTNAME" ] && echo "Please define MONGODB_HOSTNAME environment variable" && exit 1

mongo_credentials() {
    if [ ! -z ${MONGODB_ADMIN_USER+x} ] || [ ! -z ${MONGODB_ADMIN_PASSWORD+x} ]; then
    echo "--username $MONGODB_ADMIN_USER --password $MONGODB_ADMIN_PASSWORD --authenticationDatabase admin";
    else
    echo "";
    fi
}

# Wait for MongoDB to be ready
MAX_RETRIES=12
DELAY=10  # seconds
ATTEMPT=1
while [[ $ATTEMPT -le $MAX_RETRIES ]]; do
  echo "🔄 Attempt $ATTEMPT to connect..."
  if mongo --host $MONGODB_HOSTNAME $(mongo_credentials) --quiet --eval 'db.runCommand({ connectionStatus: 1 })'; then
    echo "✅ Connection was initiated successfully."
    break
  elif [[ $ATTEMPT -eq $MAX_RETRIES ]]; then
    echo "❌ Failed to initiate connection after $MAX_RETRIES attempts."
    exit 1
  fi

  echo "⏳ Failed to initiate connection. Retrying in $DELAY seconds..."
  sleep $DELAY
  ((ATTEMPT++))
done

function checkIfUserExists {
    local user=$1
    local JSON="{\"user\": \"$user\"}"
    CMD='mongo admin --host $MONGODB_HOSTNAME $(mongo_credentials) --quiet --eval "db.getCollection(\"system.users\").find($JSON).length() > 0 ? \"FOUND\" : \"NOT_FOUND\""'
    eval $CMD
}

# Rotate passwords to match the ones given to this script or create new users

function update_credentials() {
db=$1
user=$2
password=$3
roles=`echo $4 | sed 's/"//g'`
if [ -z "$roles" ]
then
  roles="[{ role: 'readWrite', db: '$db' }]"
fi
echo "db: $db, user: $user, roles: $roles"

user_exists=$(echo $(checkIfUserExists "$user"))
if [[ $user_exists != "FOUND" ]]; then
    echo "$user user not found"
    mongo $(mongo_credentials) --host $MONGODB_HOSTNAME <<EOF
    use $db
    db.createUser({
    user: '$user',
    pwd: '$password',
    roles: $roles
    })
EOF
else
    echo "$user user exists"
    mongo $(mongo_credentials) --host $MONGODB_HOSTNAME <<EOF
    use $db
    db.updateUser('$user', {
    pwd: '$password',
    roles: $roles
    })
EOF
fi
}

echo """
===============================================================
Creating new users and updating passwords
===============================================================
"""
PREFIXES=( $(env | grep -oP "[A-Z_]+_MONGODB_USER" | sed 's/_MONGODB_USER//' | sort) )
echo "MongoDB Prefixes loaded from environment variables: ${PREFIXES[@]}"
for prefix in ${PREFIXES[@]}
do
  db_var=${prefix}_MONGODB_DB
  db=${!db_var}
  password_var=${prefix}_MONGODB_PASSWORD
  password=${!password_var}
  user_var=${prefix}_MONGODB_USER
  user=${!user_var}
  roles_var=${prefix}_MONGODB_ROLES
  roles=${!roles_var}
  update_credentials $db $user $password "$roles"
done
