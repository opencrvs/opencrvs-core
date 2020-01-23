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

print_usage_and_exit () {
    echo 'Usage: ./deploy.sh COUNTRY --clear-data=yes|no --restore-metadata=yes|no HOST ENV VERSION'
    echo "  Script must receive a first COUNTRY parameter of 'bgd' or 'zmb' set  as a supported alpha-3 country code e.g.: ./deploy.sh bgd"
    echo "  --clear-data must have a value of 'yes' or 'no' set e.g. --clear-data=yes"
    echo "  --restore-metadata must have a value of 'yes' or 'no' set e.g. --restore-metadata=yes"
    echo '  HOST    is the server to deploy to'
    echo "  ENV can be 'production' or 'development' or 'qa'"
    echo "  VERSION can be any docker image tag or 'latest'"
    echo "  PAPERTRAIL can be any papertrail destination URL"
    exit 1
}

if [ -z "$1" ] || { [ $1 != 'bgd' ] && [ $1 != 'zmb' ] ;} ; then
    echo 'Error: Argument for COUNTRY is required in position 1.'
    print_usage_and_exit
fi

if [ -z "$2" ] || { [ $2 != '--clear-data=no' ] && [ $2 != '--clear-data=yes' ] ;} ; then
    echo 'Error: Argument --clear-data is required in postition 2.'
    print_usage_and_exit
fi

if [ -z "$3" ] || { [ $3 != '--restore-metadata=no' ] && [ $3 != '--restore-metadata=yes' ] ;} ; then
    echo 'Error: Argument --restore-metadata is required in postition 3.'
    print_usage_and_exit
fi

if [ -z "$4" ] || { [ $4 != '--update-metadata=no' ] && [ $4 != '--update-metadata=yes' ] ;} ; then
    echo 'Error: Argument --update-metadata is required in postition 4.'
    print_usage_and_exit
fi

if [ -z "$5" ] ; then
    echo 'Error: Argument HOST is required in postition 5.'
    print_usage_and_exit
fi

if [ -z "$6" ] ; then
    echo 'Error: Argument ENV is required in postition 6.'
    print_usage_and_exit
fi

if [ -z "$7" ] ; then
    echo 'Error: Argument VERSION is required in postition 7.'
    print_usage_and_exit
fi

COUNTRY=$1
HOST=$5
ENV=$6
VERSION=$7
SSH_USER=${SSH_USER:-root}
SSH_HOST=${SSH_HOST:-$HOST}
LOG_LOCATION=${LOG_LOCATION:-/var/log}

# Netdata user and passwrod
NETDATA_USER=${NETDATA_USER:-monitor}
NETDATA_PASSWORD=${NETDATA_PASSWORD:-monitor-password}
NETDATA_USER_DETAILS_BASE64=`echo $(htpasswd -nb $NETDATA_USER $NETDATA_PASSWORD) | base64`

echo $NETDATA_USER $NETDATA_PASSWORD $NETDATA_USER_DETAILS_BASE64

echo
echo "Deploying version $VERSION to $SSH_HOST..."
echo

mkdir -p /tmp/compose/infrastructure/default_backups
mkdir -p /tmp/compose/infrastructure/default_updates

# Copy selected country config to public & infrastructure folder
cp packages/resources/src/$COUNTRY/config/client-config.prod.js /tmp/compose/infrastructure/client-config.js
cp packages/resources/src/$COUNTRY/config/login-config.prod.js /tmp/compose/infrastructure/login-config.js

# Copy selected country default backups to infrastructure default_backups folder
cp packages/resources/src/$COUNTRY/backups/hearth-dev.gz /tmp/compose/infrastructure/default_backups/hearth-dev.gz
cp packages/resources/src/$COUNTRY/backups/openhim-dev.gz /tmp/compose/infrastructure/default_backups/openhim-dev.gz
cp packages/resources/src/$COUNTRY/backups/user-mgnt.gz /tmp/compose/infrastructure/default_backups/user-mgnt.gz

# Copy selected country default updates to infrastructure default_updates folder
[[ -d packages/resources/src/$COUNTRY/updates/generated ]] && cp packages/resources/src/$COUNTRY/updates/generated/*.json /tmp/compose/infrastructure/default_updates

# Copy all infrastructure files to the server
rsync -rP docker-compose* infrastructure $SSH_USER@$SSH_HOST:/tmp/compose/

# Copy all country compose files to the server
rsync -rP packages/resources/src/$COUNTRY/config/docker-compose* infrastructure $SSH_USER@$SSH_HOST:/tmp/compose/

# Override configuration files with country specific files
rsync -rP /tmp/compose/infrastructure $SSH_USER@$SSH_HOST:/tmp/compose

# Prepare docker-compose.deploy.yml and docker-compose.<COUNTRY>.yml file - rotate secrets etc
if [[ "$ENV" = "development" ]]; then
    ssh $SSH_USER@$SSH_HOST '/tmp/compose/infrastructure/rotate-secrets.sh /tmp/compose/docker-compose.deploy.yml /tmp/compose/docker-compose.'$COUNTRY'.deploy.yml | tee -a '$LOG_LOCATION'/rotate-secrets.log'
elif [[ "$ENV" = "qa" ]]; then
    ssh $SSH_USER@$SSH_HOST '/tmp/compose/infrastructure/rotate-secrets.sh /tmp/compose/docker-compose.deploy.yml /tmp/compose/docker-compose.qa-deploy.yml /tmp/compose/docker-compose.'$COUNTRY'.deploy.yml | tee -a '$LOG_LOCATION'/rotate-secrets.log'
else
    ssh $SSH_USER@$SSH_HOST '/tmp/compose/infrastructure/rotate-secrets.sh /tmp/compose/docker-compose.deploy.yml /tmp/compose/docker-compose.prod-deploy.yml /tmp/compose/docker-compose.'$COUNTRY'.deploy.yml | tee -a '$LOG_LOCATION'/rotate-secrets.log'
fi
# Setup configuration files and compose file for the deployment domain
ssh $SSH_USER@$SSH_HOST '/tmp/compose/infrastructure/setup-deploy-config.sh '$HOST' '$NETDATA_USER_DETAILS_BASE64' | tee -a '$LOG_LOCATION'/setup-deploy-config.log'

# Deploy the OpenCRVS stack onto the swarm
if [[ "$ENV" = "development" ]]; then
    ssh $SSH_USER@$SSH_HOST 'cd /tmp/compose && COUNTRY='$COUNTRY' VERSION='$VERSION' PAPERTRAIL='$PAPERTRAIL' docker stack deploy -c docker-compose.deps.yml -c docker-compose.yml -c docker-compose.deploy.yml -c docker-compose.'$COUNTRY'.deploy.yml --with-registry-auth opencrvs'
elif [[ "$ENV" = "qa" ]]; then
    ssh $SSH_USER@$SSH_HOST 'cd /tmp/compose && COUNTRY='$COUNTRY' VERSION='$VERSION' PAPERTRAIL='$PAPERTRAIL' docker stack deploy -c docker-compose.deps.yml -c docker-compose.yml -c docker-compose.deploy.yml -c docker-compose.qa-deploy.yml -c docker-compose.'$COUNTRY'.deploy.yml --with-registry-auth opencrvs'
else
    ssh $SSH_USER@$SSH_HOST 'cd /tmp/compose && COUNTRY='$COUNTRY' VERSION='$VERSION' PAPERTRAIL='$PAPERTRAIL' docker stack deploy -c docker-compose.deps.yml -c docker-compose.yml -c docker-compose.deploy.yml -c docker-compose.prod-deploy.yml -c docker-compose.'$COUNTRY'.deploy.yml --with-registry-auth opencrvs'
fi

if [ $2 == "--clear-data=yes" ] || [ $3 == "--restore-metadata=yes" ] || [ $4 == "--update-metadata=yes" ] ; then
    echo
    echo "Waiting 2 mins for stack to deploy before working with data..."
    echo
    sleep 120
fi

if [ $2 == "--clear-data=yes" ] ; then
    echo
    echo "Clearing all existing data..."
    echo
    ssh $SSH_USER@$SSH_HOST '/tmp/compose/infrastructure/clear-all-data.sh'
fi

if [ $3 == "--restore-metadata=yes" ] ; then
    echo
    echo "Restoring metadata..."
    echo
    ssh $SSH_USER@$SSH_HOST '/tmp/compose/infrastructure/restore-metadata.sh'
fi

if [ $4 == "--update-metadata=yes" ] ; then
    echo
    echo "Updating existing metadata..."
    echo
    ssh $SSH_USER@$SSH_HOST '/tmp/compose/infrastructure/update-metadata.sh'
fi
