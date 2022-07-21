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

# Read environment variable file for the environment
# .env.development.qa
# .env.development.development
# .env.development.production
if [ -f .env.$4 ]
then
    export $(cat .env.$4 | sed 's/#.*//g' | xargs)
fi

print_usage_and_exit () {
    echo 'Usage: ./deploy.sh --clear-data=yes|no --restore-metadata=yes|no --update-metadata=yes|no HOST ENV VERSION COUNTRY_CONFIG_VERSION COUNTRY_CONFIG_PATH REPLICAS'
    echo "  --clear-data must have a value of 'yes' or 'no' set e.g. --clear-data=yes"
    echo "  --restore-metadata must have a value of 'yes' or 'no' set e.g. --restore-metadata=yes"
    echo "  --update-metadata must have a value of 'yes' or 'no' set e.g. --update-metadata=yes"
    echo "  ENV can be 'production' or 'development' or 'qa'"
    echo '  HOST    is the server to deploy to'
    echo "  VERSION can be any OpenCRVS Core docker image tag or 'latest'"
    echo "  COUNTRY_CONFIG_VERSION can be any OpenCRVS Country Configuration docker image tag or 'latest'"
    echo "  COUNTRY_CONFIG_PATH path to where your resources package is located"
    echo "  REPLICAS number of supported mongo databases in your replica set.  Can be 1, 3 or 5"
    exit 1
}

if [ -z "$1" ] || { [ $1 != '--clear-data=no' ] && [ $1 != '--clear-data=yes' ] ;} ; then
    echo 'Error: Argument --clear-data is required in position 1.'
    print_usage_and_exit
fi

if [ -z "$2" ] || { [ $2 != '--restore-metadata=no' ] && [ $2 != '--restore-metadata=yes' ] ;} ; then
    echo 'Error: Argument --restore-metadata is required in position 2.'
    print_usage_and_exit
fi

if [ -z "$3" ] || { [ $3 != '--update-metadata=no' ] && [ $3 != '--update-metadata=yes' ] ;} ; then
    echo 'Error: Argument --update-metadata is required in postition 3.'
    print_usage_and_exit
fi

if [ -z "$4" ] ; then
    echo 'Error: Argument ENV is required in position 4.'
    print_usage_and_exit
fi

if [ -z "$5" ] ; then
    echo 'Error: Argument HOST is required in position 5.'
    print_usage_and_exit
fi

if [ -z "$6" ] ; then
    echo 'Error: Argument VERSION is required in position 6.'
    print_usage_and_exit
fi


if [ -z "$7" ] ; then
    echo 'Error: Argument COUNTRY_CONFIG_VERSION is required in position 7.'
    print_usage_and_exit
fi

if [ -z "$8" ] ; then
    echo 'Error: Argument COUNTRY_CONFIG_PATH is required in position 8.'
    print_usage_and_exit
fi

if [ -z "$9" ] ; then
    echo 'Error: Argument REPLICAS is required in position 9.'
    print_usage_and_exit
fi

if [ -z "$SMTP_HOST" ] ; then
    echo 'Error: Missing environment variable SMTP_HOST.'
    print_usage_and_exit
fi

if [ -z "$SMTP_PORT" ] ; then
    echo 'Error: Missing environment variable SMTP_PORT.'
    print_usage_and_exit
fi

if [ -z "$SMTP_USERNAME" ] ; then
    echo 'Error: Missing environment variable SMTP_USERNAME.'
    print_usage_and_exit
fi

if [ -z "$SMTP_PASSWORD" ] ; then
    echo 'Error: Missing environment variable SMTP_PASSWORD.'
    print_usage_and_exit
fi

if [ -z "$ALERT_EMAIL" ] ; then
    echo 'Error: Missing environment variable ALERT_EMAIL.'
    print_usage_and_exit
fi

if [ -z "$KIBANA_USERNAME" ] ; then
    echo 'Error: Missing environment variable KIBANA_USERNAME.'
    print_usage_and_exit
fi

if [ -z "$KIBANA_PASSWORD" ] ; then
    echo 'Error: Missing environment variable KIBANA_PASSWORD.'
    print_usage_and_exit
fi

if [ -z "$ELASTICSEARCH_SUPERUSER_PASSWORD" ] ; then
    echo 'Error: Missing environment variable ELASTICSEARCH_SUPERUSER_PASSWORD.'
    print_usage_and_exit
fi

if [ -z "$MONGODB_ADMIN_USER" ] ; then
    echo 'Error: Missing environment variable MONGODB_ADMIN_USER.'
    print_usage_and_exit
fi

if [ -z "$MONGODB_ADMIN_PASSWORD" ] ; then
    echo 'Error: Missing environment variable MONGODB_ADMIN_PASSWORD.'
    print_usage_and_exit
fi

if [ -z "$DOCKERHUB_ACCOUNT" ] ; then
    echo 'Error: Missing environment variable DOCKERHUB_ACCOUNT.'
    print_usage_and_exit
fi

if [ -z "$DOCKERHUB_REPO" ] ; then
    echo 'Error: Missing environment variable DOCKERHUB_REPO.'
    print_usage_and_exit
fi

ENV=$4
HOST=$5
VERSION=$6
COUNTRY_CONFIG_VERSION=$7
COUNTRY_CONFIG_PATH=$8
REPLICAS=$9
SSH_USER=${SSH_USER:-root}
SSH_HOST=${SSH_HOST:-$HOST}
LOG_LOCATION=${LOG_LOCATION:-/var/log}

# Rotate MongoDB credentials
# https://unix.stackexchange.com/a/230676
generate_password() {
  local password=`openssl rand -base64 25 | tr -cd '[:alnum:]._-' ; echo ''`
  echo $password
}

# Create new passwords for all MongoDB users created in
# infrastructure/mongodb/docker-entrypoint-initdb.d/create-mongo-users.sh
#
# If you're adding a new MongoDB user, you'll need to also create a new update statement in
# infrastructure/mongodb/on-deploy.sh

USER_MGNT_MONGODB_PASSWORD=`generate_password`
HEARTH_MONGODB_PASSWORD=`generate_password`
CONFIG_MONGODB_PASSWORD=`generate_password`
OPENHIM_MONGODB_PASSWORD=`generate_password`
WEBHOOKS_MONGODB_PASSWORD=`generate_password`

#
# Elasticsearch credentials
#
# Notice that all of these passwords change on each deployment.

# Application password for OpenCRVS Search
ROTATING_SEARCH_ELASTIC_PASSWORD=`generate_password`
# If new applications require access to ElasticSearch, new passwords should be generated here.
# Remember to add the user to infrastructure/elasticsearch/setup-users.sh so it is created when you deploy.

# Used by Metricsbeat when writing data to ElasticSearch
ROTATING_METRICBEAT_ELASTIC_PASSWORD=`generate_password`

# Used by APM for writing data to ElasticSearch
ROTATING_APM_ELASTIC_PASSWORD=`generate_password`

echo
echo "Deploying VERSION $VERSION to $SSH_HOST..."
echo
echo "Deploying COUNTRY_CONFIG_VERSION $COUNTRY_CONFIG_VERSION to $SSH_HOST..."
echo

mkdir -p /tmp/compose/infrastructure/default_backups
mkdir -p /tmp/compose/infrastructure/default_updates

# Copy selected country default backups to infrastructure default_backups folder
cp $COUNTRY_CONFIG_PATH/backups/hearth-dev.gz /tmp/compose/infrastructure/default_backups/hearth-dev.gz
cp $COUNTRY_CONFIG_PATH/backups/openhim-dev.gz /tmp/compose/infrastructure/default_backups/openhim-dev.gz
cp $COUNTRY_CONFIG_PATH/backups/user-mgnt.gz /tmp/compose/infrastructure/default_backups/user-mgnt.gz
cp $COUNTRY_CONFIG_PATH/backups/application-config.gz /tmp/compose/infrastructure/default_backups/application-config.gz

# Copy selected country default updates to infrastructure default_updates folder
[[ -d $COUNTRY_CONFIG_PATH/updates/generated ]] && cp $COUNTRY_CONFIG_PATH/updates/generated/*.json /tmp/compose/infrastructure/default_updates

# Copy all infrastructure files to the server
rsync -rP docker-compose* infrastructure $SSH_USER@$SSH_HOST:/tmp/compose/

# Copy all country compose files to the server
rsync -rP $COUNTRY_CONFIG_PATH/docker-compose.countryconfig* infrastructure $SSH_USER@$SSH_HOST:/tmp/compose/

# Override configuration files with country specific files
rsync -rP /tmp/compose/infrastructure $SSH_USER@$SSH_HOST:/tmp/compose

rotate_secrets() {
  files_to_rotate=$1
  echo "ROTATING SECRETS ON: $files_to_rotate"
  ssh $SSH_USER@$SSH_HOST '/tmp/compose/infrastructure/rotate-secrets.sh '$files_to_rotate' | tee -a '$LOG_LOCATION'/rotate-secrets.log'
}

# Setup configuration files and compose file for the deployment domain
ssh $SSH_USER@$SSH_HOST "SMTP_HOST=$SMTP_HOST SMTP_PORT=$SMTP_PORT SMTP_USERNAME=$SMTP_USERNAME SMTP_PASSWORD=$SMTP_PASSWORD ALERT_EMAIL=$ALERT_EMAIL /tmp/compose/infrastructure/setup-deploy-config.sh $HOST | tee -a $LOG_LOCATION/setup-deploy-config.log"

docker_stack_deploy() {
  environment_compose=$1
  replicas_compose=$2
  echo "DEPLOYING THIS ENVIRONMENT: $environment_compose"
  echo "DEPLOYING THESE REPLICAS: $replicas_compose"
  ssh $SSH_USER@$SSH_HOST 'cd /tmp/compose && \
    HOSTNAME='$HOST' \
    VERSION='$VERSION' \
    COUNTRY_CONFIG_VERSION='$COUNTRY_CONFIG_VERSION' \
    PAPERTRAIL='$PAPERTRAIL' \
    USER_MGNT_MONGODB_PASSWORD='$USER_MGNT_MONGODB_PASSWORD' \
    HEARTH_MONGODB_PASSWORD='$HEARTH_MONGODB_PASSWORD' \
    CONFIG_MONGODB_PASSWORD='$CONFIG_MONGODB_PASSWORD' \
    OPENHIM_MONGODB_PASSWORD='$OPENHIM_MONGODB_PASSWORD' \
    WEBHOOKS_MONGODB_PASSWORD='$WEBHOOKS_MONGODB_PASSWORD' \
    MONGODB_ADMIN_USER='$MONGODB_ADMIN_USER' \
    MONGODB_ADMIN_PASSWORD='$MONGODB_ADMIN_PASSWORD' \
    DOCKERHUB_ACCOUNT='$DOCKERHUB_ACCOUNT' \
    DOCKERHUB_REPO='$DOCKERHUB_REPO' \
    ELASTICSEARCH_SUPERUSER_PASSWORD='$ELASTICSEARCH_SUPERUSER_PASSWORD' \
    ROTATING_METRICBEAT_ELASTIC_PASSWORD='$ROTATING_METRICBEAT_ELASTIC_PASSWORD' \
    ROTATING_APM_ELASTIC_PASSWORD='$ROTATING_APM_ELASTIC_PASSWORD' \
    ROTATING_SEARCH_ELASTIC_PASSWORD='$ROTATING_SEARCH_ELASTIC_PASSWORD' \
    KIBANA_USERNAME='$KIBANA_USERNAME' \
    KIBANA_PASSWORD='$KIBANA_PASSWORD' \
    docker stack deploy --prune -c docker-compose.deps.yml -c docker-compose.yml -c docker-compose.deploy.yml '$environment_compose' '$replicas_compose' --with-registry-auth opencrvs'
}

FILES_TO_ROTATE="/tmp/compose/docker-compose.deploy.yml"

if [ "$REPLICAS" = "3" ]; then
  REPLICAS_COMPOSE="-c docker-compose.replicas-3.yml"
  FILES_TO_ROTATE="${FILES_TO_ROTATE} /tmp/compose/docker-compose.replicas-3.yml"
elif [ "$REPLICAS" = "5" ]; then
  REPLICAS_COMPOSE="-c docker-compose.replicas-5.yml"
  FILES_TO_ROTATE="${FILES_TO_ROTATE} /tmp/compose/docker-compose.replicas-5.yml"
elif [ "$REPLICAS" = "1" ]; then
  REPLICAS_COMPOSE=""
else
  echo "Unknown error running docker-compose on server as REPLICAS is not 1, 3 or 5."
  exit 1
fi

# Deploy the OpenCRVS stack onto the swarm
if [[ "$ENV" = "development" ]]; then
  ENVIRONMENT_COMPOSE="-c docker-compose.countryconfig.staging-deploy.yml -c docker-compose.staging-deploy.yml"
  FILES_TO_ROTATE="${FILES_TO_ROTATE} /tmp/compose/docker-compose.countryconfig.staging-deploy.yml /tmp/compose/docker-compose.staging-deploy.yml"
elif [[ "$ENV" = "qa" ]]; then
  ENVIRONMENT_COMPOSE="-c docker-compose.countryconfig.qa-deploy.yml -c docker-compose.qa-deploy.yml"
  FILES_TO_ROTATE="${FILES_TO_ROTATE} /tmp/compose/docker-compose.countryconfig.qa-deploy.yml /tmp/compose/docker-compose.qa-deploy.yml"
elif [[ "$ENV" = "production" ]]; then
  ENVIRONMENT_COMPOSE="-c docker-compose.countryconfig.prod-deploy.yml -c docker-compose.prod-deploy.yml"
  FILES_TO_ROTATE="${FILES_TO_ROTATE} /tmp/compose/docker-compose.countryconfig.prod-deploy.yml /tmp/compose/docker-compose.prod-deploy.yml"
else
  echo "Unknown error running docker-compose on server as ENV is not staging, qa or production."
  exit 1
fi

rotate_secrets "$FILES_TO_ROTATE"
docker_stack_deploy "$ENVIRONMENT_COMPOSE" "$REPLICAS_COMPOSE"

echo
echo "This script doesnt ensure that all docker containers successfully start, just that docker_stack_deploy ran successfully."
echo
echo "Waiting 2 mins for mongo to deploy before working with data. Please note it can take up to 10 minutes for the entire stack to deploy in some scenarios."
echo
sleep 120


if [ $1 == "--clear-data=yes" ] ; then
    echo
    echo "Clearing all existing data..."
    echo
    ssh $SSH_USER@$SSH_HOST "
        ELASTICSEARCH_ADMIN_USER=elastic \
        ELASTICSEARCH_ADMIN_PASSWORD=$ELASTICSEARCH_SUPERUSER_PASSWORD \
        MONGODB_ADMIN_USER=$MONGODB_ADMIN_USER \
        MONGODB_ADMIN_PASSWORD=$MONGODB_ADMIN_PASSWORD \
        /tmp/compose/infrastructure/clear-all-data.sh $REPLICAS $ENV"
fi

if [ $2 == "--restore-metadata=yes" ] ; then
    echo
    echo "Restoring metadata..."
    echo
    ssh $SSH_USER@$SSH_HOST "MONGODB_ADMIN_USER=$MONGODB_ADMIN_USER MONGODB_ADMIN_PASSWORD=$MONGODB_ADMIN_PASSWORD /tmp/compose/infrastructure/restore-metadata.sh $REPLICAS $ENV"
fi

if [ $3 == "--update-metadata=yes" ] ; then
    echo
    echo "Updating existing metadata..."
    echo
    ssh $SSH_USER@$SSH_HOST "MONGODB_ADMIN_USER=$MONGODB_ADMIN_USER MONGODB_ADMIN_PASSWORD=$MONGODB_ADMIN_PASSWORD /tmp/compose/infrastructure/restore-metadata-updates.sh $REPLICAS"
fi
