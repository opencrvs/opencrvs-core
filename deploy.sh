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
# .env.qa
# .env.development
# .env.production
if [ -f .env.$3 ]
then
    export $(cat .env.$3 | sed 's/#.*//g' | xargs)
fi

print_usage_and_exit () {
    echo 'Usage: ./deploy.sh --clear-data=yes|no --restore-metadata=yes|no HOST ENV VERSION COUNTRY_CONFIG_VERSION COUNTRY_CONFIG_PATH REPLICAS'
    echo "  --clear-data must have a value of 'yes' or 'no' set e.g. --clear-data=yes"
    echo "  --restore-metadata must have a value of 'yes' or 'no' set e.g. --restore-metadata=yes"
    echo "  ENV can be 'production' or 'development' or 'qa' or 'demo'"
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

if [ -z "$3" ] ; then
    echo 'Error: Argument ENV is required in position 3.'
    print_usage_and_exit
fi

if [ -z "$4" ] ; then
    echo 'Error: Argument HOST is required in position 4.'
    print_usage_and_exit
fi

if [ -z "$5" ] ; then
    echo 'Error: Argument VERSION is required in position 5.'
    print_usage_and_exit
fi


if [ -z "$6" ] ; then
    echo 'Error: Argument COUNTRY_CONFIG_VERSION is required in position 6.'
    print_usage_and_exit
fi

if [ -z "$7" ] ; then
    echo 'Error: Argument COUNTRY_CONFIG_PATH is required in position 7.'
    print_usage_and_exit
fi

if [ -z "$8" ] ; then
    echo 'Error: Argument REPLICAS is required in position 8.'
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

if [ -z "$OPENSEARCH_DASHBOARDS_USERNAME" ] ; then
    echo 'Error: Missing environment variable OPENSEARCH_DASHBOARDS_USERNAME.'
    print_usage_and_exit
fi

if [ -z "$OPENSEARCH_DASHBOARDS_PASSWORD" ] ; then
    echo 'Error: Missing environment variable OPENSEARCH_DASHBOARDS_PASSWORD.'
    print_usage_and_exit
fi

if [ -z "$OPENSEARCH_SUPERUSER_PASSWORD" ] ; then
    echo 'Error: Missing environment variable OPENSEARCH_SUPERUSER_PASSWORD.'
    print_usage_and_exit
fi

if [ -z "$MINIO_ROOT_USER" ] ; then
    echo 'Error: Missing environment variable MINIO_ROOT_USER.'
    print_usage_and_exit
fi

if [ -z "$MINIO_ROOT_PASSWORD" ] ; then
    echo 'Error: Missing environment variable MINIO_ROOT_PASSWORD.'
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

if [ -z "$TOKENSEEDER_MOSIP_AUTH__PARTNER_MISP_LK" ] ; then
    echo 'Info: Missing optional MOSIP environment variable TOKENSEEDER_MOSIP_AUTH__PARTNER_MISP_LK.'
    TOKENSEEDER_MOSIP_AUTH__PARTNER_MISP_LK=''
fi

if [ -z "$TOKENSEEDER_MOSIP_AUTH__PARTNER_APIKEY" ] ; then
    echo 'Info: Missing optional MOSIP environment variable TOKENSEEDER_MOSIP_AUTH__PARTNER_APIKEY.'
    TOKENSEEDER_MOSIP_AUTH__PARTNER_APIKEY=''
fi

if [ -z "$TOKENSEEDER_CRYPTO_SIGNATURE__SIGN_P12_FILE_PASSWORD" ] ; then
    echo 'Info: Missing optional MOSIP environment variable TOKENSEEDER_CRYPTO_SIGNATURE__SIGN_P12_FILE_PASSWORD.'
    TOKENSEEDER_CRYPTO_SIGNATURE__SIGN_P12_FILE_PASSWORD=''
fi

ENV=$3
HOST=$4
VERSION=$5
COUNTRY_CONFIG_VERSION=$6
COUNTRY_CONFIG_PATH=$7
REPLICAS=$8
SSH_USER=${SSH_USER:-root}
SSH_HOST=${SSH_HOST:-$HOST}
LOG_LOCATION=${LOG_LOCATION:-/var/log}

SHARED_COMPOSE_FILES="docker-compose.deps.yml docker-compose.yml docker-compose.deploy.yml"

# Rotate MongoDB credentials
# https://unix.stackexchange.com/a/230676
generate_password() {
  local password=`openssl rand -base64 25 | tr -cd '[:alnum:]._-' ; echo ''`
  echo $password
}

# Create new passwords for all MongoDB users used in
# infrastructure/mongodb/on-deploy.sh

USER_MGNT_MONGODB_PASSWORD=`generate_password`
HEARTH_MONGODB_PASSWORD=`generate_password`
CONFIG_MONGODB_PASSWORD=`generate_password`
METRICS_MONGODB_PASSWORD=`generate_password`
OPENHIM_MONGODB_PASSWORD=`generate_password`
WEBHOOKS_MONGODB_PASSWORD=`generate_password`

#
# Opensearch credentials
#
# Notice that all of these passwords change on each deployment.

# Application password for OpenCRVS Search
ROTATING_OPENSEARCH_PASSWORD=`generate_password`
# If new applications require access to Opensearch, new passwords should be generated here.
# Remember to add the user to infrastructure/opensearch/setup-users.sh so it is created when you deploy.

# Used by Metricsbeat when writing data to Opensearch
ROTATING_METRICBEAT_PASSWORD=`generate_password`

# Used by APM for writing data to Opensearch
ROTATING_APM_OPENSEARCH_PASSWORD=`generate_password`

echo
echo "Deploying VERSION $VERSION to $SSH_HOST..."
echo
echo "Deploying COUNTRY_CONFIG_VERSION $COUNTRY_CONFIG_VERSION to $SSH_HOST..."
echo

mkdir -p /tmp/opencrvs/infrastructure/default_backups
mkdir -p /tmp/opencrvs/infrastructure/cryptfs

# Copy selected country default backups to infrastructure default_backups folder
cp $COUNTRY_CONFIG_PATH/backups/hearth-dev.gz /tmp/opencrvs/infrastructure/default_backups/hearth-dev.gz
cp $COUNTRY_CONFIG_PATH/backups/openhim-dev.gz /tmp/opencrvs/infrastructure/default_backups/openhim-dev.gz
cp $COUNTRY_CONFIG_PATH/backups/user-mgnt.gz /tmp/opencrvs/infrastructure/default_backups/user-mgnt.gz
cp $COUNTRY_CONFIG_PATH/backups/application-config.gz /tmp/opencrvs/infrastructure/default_backups/application-config.gz

# Copy decrypt script
cp $COUNTRY_CONFIG_PATH/decrypt.sh /tmp/opencrvs/infrastructure/cryptfs/decrypt.sh

# Copy emergency backup script
cp $COUNTRY_CONFIG_PATH/emergency-backup-metadata.sh /tmp/opencrvs/infrastructure/emergency-backup-metadata.sh

# Copy emergency restore script
cp $COUNTRY_CONFIG_PATH/emergency-restore-metadata.sh /tmp/opencrvs/infrastructure/emergency-restore-metadata.sh

# Copy all infrastructure files to the server
rsync -rP docker-compose* infrastructure $SSH_USER@$SSH_HOST:/opt/opencrvs/

# Copy all country compose files to the server
rsync -rP $COUNTRY_CONFIG_PATH/docker-compose.countryconfig* infrastructure $SSH_USER@$SSH_HOST:/opt/opencrvs/

# Override configuration files with country specific files
rsync -rP /tmp/opencrvs/infrastructure $SSH_USER@$SSH_HOST:/opt/opencrvs

rotate_secrets() {
  files_to_rotate=$1
  echo "ROTATING SECRETS ON: $files_to_rotate"
  ssh $SSH_USER@$SSH_HOST '/opt/opencrvs/infrastructure/rotate-secrets.sh '$files_to_rotate' | tee -a '$LOG_LOCATION'/rotate-secrets.log'
}

# Setup configuration files and compose file for the deployment domain
ssh $SSH_USER@$SSH_HOST "SMTP_HOST=$SMTP_HOST SMTP_PORT=$SMTP_PORT SMTP_USERNAME=$SMTP_USERNAME SMTP_PASSWORD=$SMTP_PASSWORD ALERT_EMAIL=$ALERT_EMAIL /opt/opencrvs/infrastructure/setup-deploy-config.sh $HOST | tee -a $LOG_LOCATION/setup-deploy-config.log"

# Takes in a space separated string of docker-compose.yml files
# returns a new line separated list of images defined in those files
# This function gets a clean list of images and substitutes environment variables
# So that we have a clean list to download
get_docker_tags_from_compose_files() {
   COMPOSE_FILES=$1

   SPACE_SEPARATED_COMPOSE_FILE_LIST=$(printf " %s" "${COMPOSE_FILES[@]}")
   SPACE_SEPARATED_COMPOSE_FILE_LIST=${SPACE_SEPARATED_COMPOSE_FILE_LIST:1}

   IMAGE_TAG_LIST=$(cat $SPACE_SEPARATED_COMPOSE_FILE_LIST \
   `# Select rows with the image tag` \
   | grep image: \
   `# Only keep the image version` \
   | sed "s/image://")

   # SOME_VARIABLE:-some-default VERSION:-latest
   IMAGE_TAGS_WITH_VARIABLE_SUBSTITUTIONS_WITH_DEFAULTS=$(echo $IMAGE_TAG_LIST \
   `# Matches variables with default values like VERSION:-latest` \
   | grep -o "[A-Za-z_0-9]\+:-[A-Za-z_0-9.-]\+" \
   | sort --unique)

   # This reads Docker image tag definitions with a variable substitution
   # and defines the environment variables with the defaults unles the variable is already present.
   # Done as a preprosessing step for envsubs
   for VARIABLE_NAME_WITH_DEFAULT_VALUE in ${IMAGE_TAGS_WITH_VARIABLE_SUBSTITUTIONS_WITH_DEFAULTS[@]}; do
      IFS=':' read -r -a variable_and_default <<< "$VARIABLE_NAME_WITH_DEFAULT_VALUE"
      VARIABLE_NAME="${variable_and_default[0]}"
      # Read default value and remove the leading hyphen
      DEFAULT_VALUE=$(echo ${variable_and_default[1]} | sed "s/^-//")
      CURRENT_VALUE=$(echo "${!VARIABLE_NAME}")

      if [ -z "${!VARIABLE_NAME}" ]; then
         IMAGE_TAG_LIST=$(echo $IMAGE_TAG_LIST | sed "s/\${$VARIABLE_NAME:-$DEFAULT_VALUE}/$DEFAULT_VALUE/g")
      else
         IMAGE_TAG_LIST=$(echo $IMAGE_TAG_LIST | sed "s/\${$VARIABLE_NAME:-$DEFAULT_VALUE}/$CURRENT_VALUE/g")
      fi
   done

   IMAGE_TAG_LIST_WITHOUT_VARIABLE_SUBSTITUTION_DEFAULT_VALUES=$(echo $IMAGE_TAG_LIST \
   | sed -E "s/:-[A-Za-z_0-9]+//g" \
   | sed -E "s/[{}]//g")

   echo $IMAGE_TAG_LIST_WITHOUT_VARIABLE_SUBSTITUTION_DEFAULT_VALUES \
   | envsubst \
   | sed 's/ /\n/g'
}

split_and_join() {
   separator_for_splitting=$1
   separator_for_joining=$2
   text=$3
   SPLIT=$(echo $text | sed -e "s/$separator_for_splitting/$separator_for_joining/g")
   echo $SPLIT
}

docker_stack_deploy() {
  environment_compose=$1
  replicas_compose=$2
  echo "DEPLOYING THIS ENVIRONMENT: $environment_compose"
  echo "DEPLOYING THESE REPLICAS: $replicas_compose"


  ENVIRONMENT_COMPOSE_WITH_LOCAL_PATHS=$(echo "$environment_compose" | sed "s|docker-compose.countryconfig|$COUNTRY_CONFIG_PATH/docker-compose.countryconfig|")
  REPLICAS_COMPOSE_WITH_LOCAL_PATHS=$(echo "$replicas_compose" | sed "s|docker-compose.countryconfig|$COUNTRY_CONFIG_PATH/docker-compose.countryconfig|")

  ENV_VARIABLES="HOSTNAME=$HOST
  VERSION=$VERSION
  COUNTRY_CONFIG_VERSION=$COUNTRY_CONFIG_VERSION
  PAPERTRAIL=$PAPERTRAIL
  USER_MGNT_MONGODB_PASSWORD=$USER_MGNT_MONGODB_PASSWORD
  HEARTH_MONGODB_PASSWORD=$HEARTH_MONGODB_PASSWORD
  CONFIG_MONGODB_PASSWORD=$CONFIG_MONGODB_PASSWORD
  METRICS_MONGODB_PASSWORD=$METRICS_MONGODB_PASSWORD
  OPENHIM_MONGODB_PASSWORD=$OPENHIM_MONGODB_PASSWORD
  WEBHOOKS_MONGODB_PASSWORD=$WEBHOOKS_MONGODB_PASSWORD
  MONGODB_ADMIN_USER=$MONGODB_ADMIN_USER
  MONGODB_ADMIN_PASSWORD=$MONGODB_ADMIN_PASSWORD
  MINIO_ROOT_USER=$MINIO_ROOT_USER
  MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD
  DOCKERHUB_ACCOUNT=$DOCKERHUB_ACCOUNT
  DOCKERHUB_REPO=$DOCKERHUB_REPO
  OPENSEARCH_SUPERUSER_PASSWORD=$OPENSEARCH_SUPERUSER_PASSWORD
  ROTATING_METRICBEAT_PASSWORD=$ROTATING_METRICBEAT_PASSWORD
  ROTATING_APM_OPENSEARCH_PASSWORD=$ROTATING_APM_OPENSEARCH_PASSWORD
  ROTATING_OPENSEARCH_PASSWORD=$ROTATING_OPENSEARCH_PASSWORD
  OPENSEARCH_DASHBOARDS_USERNAME=$OPENSEARCH_DASHBOARDS_USERNAME
  OPENSEARCH_DASHBOARDS_PASSWORD=$OPENSEARCH_DASHBOARDS_PASSWORD
  TOKENSEEDER_MOSIP_AUTH__PARTNER_MISP_LK=$TOKENSEEDER_MOSIP_AUTH__PARTNER_MISP_LK
  TOKENSEEDER_MOSIP_AUTH__PARTNER_APIKEY=$TOKENSEEDER_MOSIP_AUTH__PARTNER_APIKEY
  TOKENSEEDER_CRYPTO_SIGNATURE__SIGN_P12_FILE_PASSWORD=$TOKENSEEDER_CRYPTO_SIGNATURE__SIGN_P12_FILE_PASSWORD"

  echo "Pulling all docker images. This might take a while"

  EXISTING_IMAGES=$(ssh $SSH_USER@$SSH_HOST "docker images --format '{{.Repository}}:{{.Tag}}'")
  IMAGE_TAGS_TO_DOWNLOAD=$(get_docker_tags_from_compose_files "$SHARED_COMPOSE_FILES $ENVIRONMENT_COMPOSE_WITH_LOCAL_PATHS $REPLICAS_COMPOSE_WITH_LOCAL_PATHS")

  for tag in ${IMAGE_TAGS_TO_DOWNLOAD[@]}; do
    if [[ $EXISTING_IMAGES == *"$tag"* ]]; then
      echo "$tag already exists on the machine. Skipping..."
      continue
    fi

    echo "Downloading $tag"

    until ssh $SSH_USER@$SSH_HOST "cd /opt/opencrvs && docker pull $tag"
    do
      echo "Server failed to download $tag. Retrying..."
      sleep 5
    done
  done

  echo "Updating docker swarm stack with new compose files"
  ssh $SSH_USER@$SSH_HOST 'cd /opt/opencrvs && \
    '$ENV_VARIABLES' docker stack deploy --prune -c '$(split_and_join " " " -c " "$SHARED_COMPOSE_FILES $environment_compose $replicas_compose")' --with-registry-auth opencrvs'
}

FILES_TO_ROTATE="/opt/opencrvs/docker-compose.deploy.yml"

if [ "$REPLICAS" = "3" ]; then
  REPLICAS_COMPOSE="docker-compose.replicas-3.yml docker-compose.countryconfig.replicas-3.yml"
  FILES_TO_ROTATE="${FILES_TO_ROTATE} /opt/opencrvs/docker-compose.replicas-3.yml"
elif [ "$REPLICAS" = "5" ]; then
  REPLICAS_COMPOSE="docker-compose.replicas-5.yml docker-compose.countryconfig.replicas-5.yml"
  FILES_TO_ROTATE="${FILES_TO_ROTATE} /opt/opencrvs/docker-compose.replicas-5.yml"
elif [ "$REPLICAS" = "1" ]; then
  REPLICAS_COMPOSE="docker-compose.countryconfig.replicas-1.yml"
else
  echo "Unknown error running docker-compose on server as REPLICAS is not 1, 3 or 5."
  exit 1
fi

# Deploy the OpenCRVS stack onto the swarm
if [[ "$ENV" = "development" ]]; then
  ENVIRONMENT_COMPOSE="docker-compose.countryconfig.staging-deploy.yml docker-compose.staging-deploy.yml"
  FILES_TO_ROTATE="${FILES_TO_ROTATE} /opt/opencrvs/docker-compose.countryconfig.staging-deploy.yml /opt/opencrvs/docker-compose.staging-deploy.yml"
elif [[ "$ENV" = "qa" ]]; then
  ENVIRONMENT_COMPOSE="docker-compose.countryconfig.qa-deploy.yml docker-compose.qa-deploy.yml"
  FILES_TO_ROTATE="${FILES_TO_ROTATE} /opt/opencrvs/docker-compose.countryconfig.qa-deploy.yml /opt/opencrvs/docker-compose.qa-deploy.yml"
elif [[ "$ENV" = "production" ]]; then
  ENVIRONMENT_COMPOSE="docker-compose.countryconfig.prod-deploy.yml docker-compose.prod-deploy.yml"
  FILES_TO_ROTATE="${FILES_TO_ROTATE} /opt/opencrvs/docker-compose.countryconfig.prod-deploy.yml /opt/opencrvs/docker-compose.prod-deploy.yml"
elif [[ "$ENV" = "demo" ]]; then
  ENVIRONMENT_COMPOSE="docker-compose.countryconfig.demo-deploy.yml docker-compose.prod-deploy.yml"
  FILES_TO_ROTATE="${FILES_TO_ROTATE} /opt/opencrvs/docker-compose.countryconfig.demo-deploy.yml /opt/opencrvs/docker-compose.prod-deploy.yml"
else
  echo "Unknown error running docker-compose on server as ENV is not staging, qa, demo or production."
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
        OPENSEARCH_ADMIN_USER=opensearch \
        OPENSEARCH_ADMIN_PASSWORD=$OPENSEARCH_SUPERUSER_PASSWORD \
        MONGODB_ADMIN_USER=$MONGODB_ADMIN_USER \
        MONGODB_ADMIN_PASSWORD=$MONGODB_ADMIN_PASSWORD \
        /opt/opencrvs/infrastructure/clear-all-data.sh $REPLICAS $ENV"
fi

if [ $2 == "--restore-metadata=yes" ] ; then
    echo
    echo "Restoring metadata..."
    echo
    ssh $SSH_USER@$SSH_HOST "MONGODB_ADMIN_USER=$MONGODB_ADMIN_USER MONGODB_ADMIN_PASSWORD=$MONGODB_ADMIN_PASSWORD /opt/opencrvs/infrastructure/restore-metadata.sh $REPLICAS $ENV"
fi
