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
echo
echo "Rotating secrets - `date --iso-8601=ns`"

PRIV_KEY=$(openssl genrsa 2048 2>/dev/null)
PUB_KEY=$(echo "$PRIV_KEY" | openssl rsa -pubout 2>/dev/null)
UNIX_TS=$(date +%s)

echo "$PUB_KEY" | docker secret create jwt-public-key.$UNIX_TS -
echo "$PRIV_KEY" | docker secret create jwt-private-key.$UNIX_TS -

sed -i "s/{{ts}}/$UNIX_TS/g" "$@"
echo "DONE - `date --iso-8601=ns`"
echo
