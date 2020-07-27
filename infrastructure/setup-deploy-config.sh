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
echo "Setting up deployment config for $1 - `date --iso-8601=ns`"

# Set hostname in traefik config
sed -i "s/{{hostname}}/$1/g" /tmp/compose/infrastructure/traefik.toml

# Set hostname in nginx config
sed -i "s/{{hostname}}/$1/g" /tmp/compose/infrastructure/nginx-default.conf

# Set hostname in openhim-console config
sed -i "s/{{hostname}}/$1/g" /tmp/compose/infrastructure/openhim-console-config.deploy.json

# Set hostname in compose file
sed -i "s/{{hostname}}/$1/g" /tmp/compose/docker-compose.deploy.yml

# Set netdata user details in compose file
USER_DETAILS=$(echo $2 | base64 -d | sed -e s/\\$/\\$\\$/g)
sed -i "s#{{netdata_user}}#$USER_DETAILS#g" /tmp/compose/docker-compose.deploy.yml

# Setup API key for netdata streaming
NETDATA_API_KEY=`uuidgen`
sed -i "s/{{NETDATA_API_KEY}}/$NETDATA_API_KEY/g" /tmp/compose/infrastructure/netdata-master-stream.conf
sed -i "s/{{NETDATA_API_KEY}}/$NETDATA_API_KEY/g" /tmp/compose/infrastructure/netdata-slave-stream.conf

echo "DONE - `date --iso-8601=ns`"
echo