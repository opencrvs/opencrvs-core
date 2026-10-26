# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
set -e

print_usage_and_exit () {
    echo 'Usage: ./check-before-build.sh REGISTRY_USERNAME REGISTRY_TOKEN IMAGE_TAG [REGISTRY_HOST]'
    echo 'REGISTRY_HOST is the host of the container registry (default: $REGISTRY_HOST, or docker.io)'
    exit 1
}

if [ -z "$1" ] ; then
    echo 'Error: Argument REGISTRY_USERNAME is required in position 1.'
    print_usage_and_exit
fi

if [ -z "$2" ] ; then
    echo 'Error: Argument REGISTRY_TOKEN is required in position 2.'
    print_usage_and_exit
fi

if [ -z "$3" ] ; then
    echo 'Error: Argument IMAGE_TAG is required in position 3.'
    print_usage_and_exit
fi

COMPOSE_FILE="docker-compose.yml"
REGISTRY_USERNAME=$1
REGISTRY_TOKEN=$2
IMAGE_TAG=$3
REGISTRY_HOST=${4:-${REGISTRY_HOST:-docker.io}}

# Images that name no registry host (e.g. opencrvs/ocrvs-auth) live in REGISTRY_HOST
function qualified_image() {
    case "${1%%/*}" in
        *.* | *:* | localhost) echo "$1" ;;
        *) echo "$REGISTRY_HOST/$1" ;;
    esac
}

# Asks the registry through the Docker CLI, which speaks to every OCI registry
function docker_tag_exists() {
    docker manifest inspect "$(qualified_image $1):$2" > /dev/null 2>&1
}

# Takes in a docker-compose.yml file name and returns
# a new line separated list of images defined in the file
get_docker_tags_from_compose_files() {
   COMPOSE_FILE=$1
   IMAGE_TAG_LIST_WITH_VERSION=$(cat $COMPOSE_FILE \
   `# Select rows with the image tag` \
   | grep image: \
   `# Only keep the image version` \
   | sed "s/image://")

   IMAGE_TAG_LIST=$(echo $IMAGE_TAG_LIST_WITH_VERSION | sed s/':${VERSION:-latest}'//g)
   echo $IMAGE_TAG_LIST
}

echo "$REGISTRY_TOKEN" | docker login "$REGISTRY_HOST" -u "$REGISTRY_USERNAME" --password-stdin

imagesAlreadyBuilt="true"
IMAGE_TAGS_TO_CHECK=$(get_docker_tags_from_compose_files "$COMPOSE_FILE")

for tag in ${IMAGE_TAGS_TO_CHECK[@]}; do
    if docker_tag_exists $tag $IMAGE_TAG; then
        echo -e "OpenCRVS thinks $tag is already built.\r"
    else
        echo -e "OpenCRVS thinks $tag is not built.\r"
        imagesAlreadyBuilt="false"
        break
    fi
done

if [ $imagesAlreadyBuilt == "false" ]; then
  pnpm compose:push:version
fi
