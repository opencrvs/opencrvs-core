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

echo
echo "Updating existing metadata..."
echo

# Step-1: Execute scripts to update existing metadata in local db
ts-node -r tsconfig-paths/register src/bgd/updates/scripts/update-metadata.ts

echo
echo "Started exporting metadata updates..."
echo
mkdir -p $DIR/src/bgd/updates/generated

# Step-2: Export new metadata changes into committable json files for others to apply
# adjust/add the query param in mongoexport command to make sure that your new changes are exported properly

# FORMAT of the exported filename should be always: 
# {db}_{collection}_{any string}.json ex: user-mgnt_users_blabla.json
# This format is needed to restore these data updates

[[ ! -f $DIR/src/bgd/updates/generated/hearth-dev_Practitioner_updates.json ]] && docker run --rm -v $DIR/src/bgd/updates/generated:/src/bgd/updates/generated --network=$NETWORK mongo:3.6 bash \
 -c "mongoexport -h=$HOST -d=hearth-dev -c=Practitioner -q='{id:\"2c974c10-a582-4697-b8a4-31dd538123bd\"}' -o=/src/bgd/updates/generated/hearth-dev_Practitioner_updates.json"
[[ ! -f $DIR/src/bgd/updates/generated/user-mgnt_roles_updates.json ]] && docker run --rm -v $DIR/src/bgd/updates/generated:/src/bgd/updates/generated --network=$NETWORK mongo:3.6 bash \
 -c "mongoexport -h=$HOST -d=user-mgnt -c=roles -q='{types:\"API_USER\"}' -o=/src/bgd/updates/generated/user-mgnt_roles_updates.json"
[[ ! -f $DIR/src/bgd/updates/generated/user-mgnt_users_updates.json ]] && docker run --rm -v $DIR/src/bgd/updates/generated:/src/bgd/updates/generated --network=$NETWORK mongo:3.6 bash \
 -c "mongoexport -h=$HOST -d=user-mgnt -c=users -q='{username:{\$regex:\"api.*\"}}' -o=/src/bgd/updates/generated/user-mgnt_users_updates.json"

echo
echo "Finished exporting metadata updates."
echo "Please verify the change metadata set (if any) before committing it." 
echo "Change metadata set is available in @resources/src/bgd/updates/generated/" 
echo
