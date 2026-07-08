# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
set -e
DIR=$(cd "$(dirname "$0")"; pwd)

export LANGUAGES="en,fr"

if [  -n "$(uname -a | grep Ubuntu)" ]; then
  OS="UBUNTU"
  else
  OS="MAC"
fi

if [ ! $OS == "UBUNTU" ]; then
  export LOCAL_IP=host-gateway
fi

####
#
# SUPER USER MODE
# --only-dependencies / --only-services start only the dependencies or services,
# so more experienced users can run the stack across different terminal windows.
# --no-testland excludes the bundled testland country-config from the dev sweep,
# for devs running against an external country-config checkout (two-terminal, unchanged).
#
###
dependencies=false
services=false

for arg in "$@"
do
  case $arg in
    --only-dependencies)
      dependencies=true
      ;;
    --only-services)
      services=true
      ;;
    --no-testland)
      export OTHER_LERNA_FLAGS="--ignore @opencrvs/testland"
      ;;
    *)
      # Handle unknown option
      echo "Unknown option: $arg"
      exit 1
      ;;
  esac
done

# List of directories
dirs=(
  "data/elasticsearch"
  "data/minio"
  "data/backups"
  "data/postgres"
)

for dir in "${dirs[@]}"; do
  if [ ! -d "$dir" ]; then
    echo "Creating $dir"
    mkdir -p "$dir"
    chmod 775 "$dir"
  else
    echo "$dir already exists"
  fi
done

if $dependencies; then
  concurrently "yarn run compose:deps"
  exit 0
elif $services; then
  yarn run start
  exit 0
fi

echo
echo -e "\033[32m:::::::::: Stopping any currently running Docker containers ::::::::::\033[0m"
echo
if [[ $(docker ps -aq) ]] ; then
  docker stop $(docker ps -aq)
  sleep 5
fi


echo
openCRVSPorts=( 3447 9200 6379 4444 5050 2020 7070 1050 3030 3000 3020 2525 2021 3535 3536 9050)
for x in "${openCRVSPorts[@]}"
do
   :
    if lsof -nP -iTCP:$x -sTCP:LISTEN -iUDP:$x >/dev/null; then
      echo -e "OpenCRVS thinks that port: $x is in use by another application.\r"
      echo "You need to find out which application is using this port and quit the application."
      echo "You can find out the application by running:"
      echo "lsof -nP -iTCP:$x -sTCP:LISTEN -iUDP:$x"
      exit 1
    else
        echo -e "$x \033[32m port is available!\033[0m :)"
    fi
done



echo
echo -e "\033[32m:::::::::: STARTING OPENCRVS ::::::::::\033[0m"
echo

yarn dev:secrets:gen

concurrently "yarn run start" "yarn run compose:deps"
