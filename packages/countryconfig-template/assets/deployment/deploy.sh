# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
set -e

BASEDIR=$(dirname $(realpath $0))
INFRASTRUCTURE_DIRECTORY=$(dirname $BASEDIR)
PROJECT_ROOT=$(pwd)

while [ "$PROJECT_ROOT" != "/" ]; do
  if [ -f "$PROJECT_ROOT/package.json" ]; then
    break
  fi
  PROJECT_ROOT=$(dirname "$PROJECT_ROOT")
done

# Reading Names parameters
for i in "$@"; do
    case $i in
    --host=*)
        HOST="${i#*=}"
        shift
        ;;
    --ssh_host=*)
        SSH_HOST="${i#*=}"
        shift
        ;;
    --ssh_user=*)
        SSH_USER="${i#*=}"
        shift
        ;;
    --ssh_port=*)
        SSH_PORT="${i#*=}"
        shift
        ;;
    --environment=*)
        ENV="${i#*=}"
        shift
        ;;
    --version=*)
        export VERSION="${i#*=}"
        shift
        ;;
    --country_config_version=*)
        # Exported so that it can be used in the docker-compose files
        export COUNTRY_CONFIG_VERSION="${i#*=}"
        shift
        ;;
    --replicas=*)
        # Exported so that it can be used in the docker-compose files
        export REPLICAS="${i#*=}"
        shift
        ;;
    *) ;;

    esac
done


# Default values
SSH_ARGS=${SSH_ARGS:-}
LOG_LOCATION=${LOG_LOCATION:-/var/log}

COMPOSE_FILES_DOWNLOADED_FROM_CORE="/tmp/docker-compose.deps.yml /tmp/docker-compose.yml"
ENVIRONMENT_COMPOSE="$INFRASTRUCTURE_DIRECTORY/docker-compose.$ENV-deploy.yml"
COMPOSE_FILES_USED="$COMPOSE_FILES_DOWNLOADED_FROM_CORE $INFRASTRUCTURE_DIRECTORY/docker-compose.deploy.yml $ENVIRONMENT_COMPOSE"

echo $COMPOSE_FILES_USED

# Read environment variable file for the environment
# .env.qa
# .env.development
# .env.production
if [ -f $PROJECT_ROOT/.env.$ENV ]
then
  while IFS='' read -r line || [[ -n "$line" ]]; do
    eval "export $line"
  done < $PROJECT_ROOT/.env.$ENV
fi

trap trapint SIGINT SIGTERM
function trapint {
  exit 0
}

print_usage_and_exit () {
  echo 'Usage: ./deploy.sh --host --environment --ssh_host --ssh_port --ssh_user --version --country_config_version --replicas'
  echo "  --environment can be 'production', 'development', 'qa' or similar"
  echo '  --host    is the server to deploy to'
  echo "  --version can be any OpenCRVS Core docker image tag or 'latest'"
  echo "  --country_config_version can be any OpenCRVS Country Configuration docker image tag or 'latest'"
  echo "  --replicas number of supported mongo databases in your replica set.  Can be 1, 3 or 5"
  exit 1
}

validate_options() {
  if [ -z "$ENV" ] ; then
    echo 'Error: Argument --environment is required.'
    print_usage_and_exit
  fi

  if [ -z "$HOST" ] ; then
    echo 'Error: Argument --host is required'
    print_usage_and_exit
  fi

  if [ -z "$VERSION" ] ; then
    echo 'Error: Argument --version is required.'
    print_usage_and_exit
  fi

  if [ -z "$SSH_HOST" ] ; then
    echo 'Error: Argument --ssh_host is required.'
    print_usage_and_exit
  fi

  if [ -z "$SSH_PORT" ] ; then
    echo 'Error: Argument --ssh_port is required.'
    print_usage_and_exit
  fi

  if [ -z "$SSH_USER" ] ; then
    echo 'Error: Argument --ssh_user is required.'
    print_usage_and_exit
  fi

  if [ -z "$COUNTRY_CONFIG_VERSION" ] ; then
    echo 'Error: Argument --country_config_version is required.'
    print_usage_and_exit
  fi

  if [ -z "$REPLICAS" ] ; then
    echo 'Error: Argument --replicas is required in position 8.'
    print_usage_and_exit
  fi
}

validate_environment_variables() {
  # These ones are directly required by this script
  # and thus should be set in the environment variables even
  # if not required by compose files
  if [ -z "$ALERT_EMAIL" ] ; then
      echo 'Error: Missing environment variable ALERT_EMAIL.'
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

  npx tsx $BASEDIR/validate-required-variables-in-compose-files.ts $COMPOSE_FILES_USED
}

configured_rsync() {
  rsync -e "ssh -p $SSH_PORT $SSH_ARGS" "$@"
}

get_environment_variables() {
  local env_vars=""
  # Define an array of variables to exclude
  local exclude_vars=("PATH" "SSH_ARGS" "HOME" "LANG" "USER" "SHELL" "PWD")

  while IFS='=' read -r name value; do
    # Check if the variable is in the exclude list
    if printf '%s\n' "${exclude_vars[@]}" | grep -qx "$name"; then
      # Skip the variable if it's in the exclude list
      continue
    fi

    # Exclude variables that start with specified patterns
    if [[ ! $name =~ ^(npm_|RUNNER_TOOL_CACHE|GITHUB_) ]]; then
      # Safely escape and quote the value
      printf -v escaped_value "%q" "$value"
      env_vars+="${name}=\"${escaped_value}\" "
    fi
  done < <(printenv)

  echo "$env_vars"
}

configured_ssh() {
  ssh $SSH_USER@$SSH_HOST -p $SSH_PORT $SSH_ARGS "export $(get_environment_variables); $@"
}

# Rotate MongoDB credentials
# https://unix.stackexchange.com/a/230676
generate_password() {
  local password=`openssl rand -base64 25 | tr -cd '[:alnum:]._-' ; echo ''`
  echo $password
}

to_remote_paths() {
  paths=$@
  echo "$paths" | sed "s|/tmp/|/opt/opencrvs/infrastructure/|g" | sed "s|$INFRASTRUCTURE_DIRECTORY/docker-compose|/opt/opencrvs/infrastructure/docker-compose|g"
}

rotate_secrets() {
  files_to_rotate=$(to_remote_paths $COMPOSE_FILES_USED)
  configured_ssh '/opt/opencrvs/infrastructure/rotate-secrets.sh '$files_to_rotate' | tee -a '$LOG_LOCATION'/rotate-secrets.log'
}

# Take generated passwords and save them to a file
# File is taken from github runner and transferred to the server
# Later docker secret is created from this file and used by docker-compose
save_redis_acl(){
  echo "Saving redis acl"
  printf """
user default on >$DEFAULT_REDIS_PASSWORD ~* +@all
user $GATEWAY_REDIS_USERNAME on >$GATEWAY_REDIS_PASSWORD ~* +@all
user $AUTH_REDIS_USERNAME on >$AUTH_REDIS_PASSWORD ~* +@all
""" > $INFRASTRUCTURE_DIRECTORY/redis-acl.conf
  echo "Redis acl saved to $INFRASTRUCTURE_DIRECTORY/redis-acl.conf"
}

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
   `# Ignore the baseimage file as its not used directly` \
   | grep -v ocrvs-base \
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
cleanup_docker_images()
{
   echo "Cleaning up the docker images"
   configured_ssh "/usr/bin/docker system prune -af | sudo tee -a /var/log/docker-prune.log > /dev/null"
}

docker_stack_deploy() {
  echo "Deploying this environment: $ENVIRONMENT_COMPOSE"

  echo "Pulling all docker images. This might take a while"

  EXISTING_IMAGES=$(configured_ssh "docker images --format '{{.Repository}}:{{.Tag}}'")
  IMAGE_TAGS_TO_DOWNLOAD=$(get_docker_tags_from_compose_files "$COMPOSE_FILES_USED")

  for tag in ${IMAGE_TAGS_TO_DOWNLOAD[@]}; do
    if [[ $EXISTING_IMAGES == *"$tag"* ]]; then
      echo "$tag already exists on the machine. Skipping..."
      continue
    fi

    echo "Downloading $tag"

    until configured_ssh "cd /opt/opencrvs && docker pull $tag"
    do
      echo "Server failed to download $tag. Retrying..."
      sleep 5
    done &
  done
  wait
  echo "Images are successfully downloaded"
  echo "Updating docker swarm stack with new compose files"

  configured_ssh 'cd /opt/opencrvs && \
    docker stack deploy --prune -c '$(split_and_join " " " -c " "$(to_remote_paths $COMPOSE_FILES_USED)")' --with-registry-auth opencrvs'
}

get_opencrvs_version() {
  PREVIOUS_VERSION=$(configured_ssh "docker service ls | grep opencrvs_base | cut -d ':' -f 2")
  echo "Previous opencrvs version: $PREVIOUS_VERSION"
  echo "Current opencrvs version: $VERSION"
}

validate_options

get_opencrvs_version

# Create new passwords for all MongoDB users created in
# infrastructure/mongodb/docker-entrypoint-initdb.d/create-mongo-users.sh
#
# If you're adding a new MongoDB user, you'll need to also create a new update statement in
# infrastructure/mongodb/on-deploy.sh

export USER_MGNT_MONGODB_PASSWORD=`generate_password`
export HEARTH_MONGODB_PASSWORD=`generate_password`
export METRICS_MONGODB_PASSWORD=`generate_password`
export PERFORMANCE_MONGODB_PASSWORD=`generate_password`
export OPENHIM_MONGODB_PASSWORD=`generate_password`
export EVENTS_MONGODB_PASSWORD=`generate_password`

export DEFAULT_REDIS_PASSWORD=`generate_password`
export GATEWAY_REDIS_USERNAME=`generate_password`
export GATEWAY_REDIS_PASSWORD=`generate_password`
export AUTH_REDIS_USERNAME=`generate_password`
export AUTH_REDIS_PASSWORD=`generate_password`

export EVENTS_APP_POSTGRES_PASSWORD=`generate_password`
export EVENTS_MIGRATOR_POSTGRES_PASSWORD=`generate_password`
export ANALYTICS_POSTGRES_PASSWORD=`generate_password`

#
# Elasticsearch credentials
#
# Notice that all of these passwords change on each deployment.

# Application password for OpenCRVS Search
export ROTATING_SEARCH_ELASTIC_PASSWORD=`generate_password`
# If new applications require access to ElasticSearch, new passwords should be generated here.
# Remember to add the user to infrastructure/elasticsearch/setup-users.sh so it is created when you deploy.

# Used by Metricsbeat when writing data to ElasticSearch
export ROTATING_METRICBEAT_ELASTIC_PASSWORD=`generate_password`

# Used by APM for writing data to ElasticSearch
export ROTATING_APM_ELASTIC_PASSWORD=`generate_password`

# Download core compose files to /tmp/
for compose_file in ${COMPOSE_FILES_DOWNLOADED_FROM_CORE[@]}; do
  if [ ! -f $compose_file ]; then
    echo "Downloading $compose_file from https://raw.githubusercontent.com/opencrvs/opencrvs-core/$VERSION/$(basename $compose_file)"
    curl -o $compose_file https://raw.githubusercontent.com/opencrvs/opencrvs-core/$VERSION/$(basename $compose_file)
  fi
done

validate_environment_variables
save_redis_acl

if [ "$SSH_PORT" -eq 22 ]; then
    SSH_HOST_TO_CHECK="$SSH_HOST"
else
    SSH_HOST_TO_CHECK="[$SSH_HOST]:$SSH_PORT"
fi

if ! ssh-keygen -l -F "$SSH_HOST_TO_CHECK" -f "$INFRASTRUCTURE_DIRECTORY/known-hosts"; then
  echo "Host key for [$SSH_HOST]:$SSH_PORT not found in $INFRASTRUCTURE_DIRECTORY/known-hosts. Please add the host key to the known-hosts file."
  echo "You can do this by running the following command:"
  echo "sh ./infrastructure/environments/update-known-hosts.sh <YOUR DOMAIN>"
  echo ""
  echo "or"
  echo ""
  echo "sh ./infrastructure/environments/update-known-hosts.sh <YOUR SERVER IP>"
  exit 1
fi

echo
echo "Deploying VERSION $VERSION to $SSH_HOST..."
echo
echo "Deploying COUNTRY_CONFIG_VERSION $COUNTRY_CONFIG_VERSION to $SSH_HOST..."
echo
echo "Syncing configuration files to the target server"


configured_rsync -rlD $PROJECT_ROOT/infrastructure $SSH_USER@$SSH_HOST:/opt/opencrvs/ --delete --no-perms --omit-dir-times --verbose
configured_rsync -rlD /tmp/docker-compose.yml /tmp/docker-compose.deps.yml $SSH_USER@$SSH_HOST:/opt/opencrvs/infrastructure --no-perms --omit-dir-times  --verbose

echo "Logging to Dockerhub"

configured_ssh "docker login -u $DOCKER_USERNAME -p $DOCKER_TOKEN"

# Setup configuration files and compose file for the deployment domain
configured_ssh "/opt/opencrvs/infrastructure/setup-deploy-config.sh $HOST"

rotate_secrets

cleanup_docker_images

docker_stack_deploy

echo
echo "This script doesnt ensure that all docker containers successfully start, just that docker_stack_deploy ran successfully."
echo
echo "Waiting 2 mins for mongo to deploy before working with data. Please note it can take up to 10 minutes for the entire stack to deploy in some scenarios."
echo

echo 'Setting up elastalert indices'

while true; do
  if configured_ssh "/opt/opencrvs/infrastructure/elasticsearch/setup-elastalert-indices.sh"; then
    break
  fi
  sleep 5
done

echo "Setting up Kibana config & alerts"

while true; do
  if configured_ssh "HOST=kibana.$HOST /opt/opencrvs/infrastructure/monitoring/kibana/setup-config.sh"; then
    break
  fi
  sleep 5
done

# Send a notification email to confirm emails are working
EMAIL_PAYLOAD='{
  "subject": "🚀 Deployment to '$ENV' finished",
  "html": "Deployment to '$ENV' was successful with images '$VERSION' for core and '$COUNTRY_CONFIG_VERSION' for country config.",
  "from": "{{SENDER_EMAIL_ADDRESS}}",
  "to": "{{ALERT_EMAIL}}"
}'

configured_ssh "docker run --rm --network=opencrvs_overlay_net appropriate/curl \
  -X POST 'http://countryconfig:3040/email' \
  -H 'Content-Type: application/json' \
  -d '$EMAIL_PAYLOAD'"