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
    echo 'Usage: ./check-before-build.sh DOCKERHUB_USERNAME DOCKERHUB_PASSWORD IMAGE_TAG'
    exit 1
}

if [ -z "$1" ] ; then
    echo 'Error: Argument DOCKERHUB_USERNAME is required in position 1.'
    print_usage_and_exit
fi

if [ -z "$2" ] ; then
    echo 'Error: Argument DOCKERHUB_PASSWORD is required in position 2.'
    print_usage_and_exit
fi

if [ -z "$3" ] ; then
    echo 'Error: Argument IMAGE_TAG is required in position 3.'
    print_usage_and_exit
fi

DOCKERHUB_USERNAME=$1
DOCKERHUB_PASSWORD=$2
IMAGE_TAG=$3

function docker_tag_exists() {
    TOKEN=$(curl -s -H "Content-Type: application/json" -X POST -d '{"username": "'${DOCKERHUB_USERNAME}'", "password": "'${DOCKERHUB_PASSWORD}'"}' https://hub.docker.com/v2/users/login/ | jq -r .token)
    curl --silent -f --head -lL https://hub.docker.com/v2/repositories/$1/tags/$2/ > /dev/null
}

images=( "opencrvs/ocrvs-webhooks" "opencrvs/ocrvs-user-mgnt" "opencrvs/ocrvs-auth" "opencrvs/ocrvs-metrics" "opencrvs/ocrvs-search" "opencrvs/ocrvs-workflow" "opencrvs/ocrvs-gateway" "opencrvs/ocrvs-client" "opencrvs/ocrvs-components" "opencrvs/ocrvs-config" "opencrvs/ocrvs-notification")
imagesAlreadyBuilt="true"
for i in "${images[@]}"
do
   :
    if docker_tag_exists $i $IMAGE_TAG; then
        echo -e "OpenCRVS thinks $i is already built.\r"
    else
        echo -e "OpenCRVS thinks $i is not built.\r"
        imagesAlreadyBuilt="false"
        break
    fi
done

if [ $imagesAlreadyBuilt == "false" ]; then
  yarn compose:push:version
fi





