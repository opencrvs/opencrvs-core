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
ts-node -r tsconfig-paths/register src/zmb/updates/scripts/update-metadata.ts

echo
echo "Exporting metadata updates..."
echo
mkdir -p $DIR/src/zmb/updates/jsons

# FORMAT of the exported filename should be always: 
# {db}_{collection}_{any string}.json ex: user-mgnt_users_blabla.json
# This format is needed to restore these data updates

# TODO: Need to add mongoexport commands here once we have something to update