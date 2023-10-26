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
export LOG_LEVEL="error"

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
# Using --only-dependences or --only-services will start only the dependencies or services.
# This is done so that more experienced users could start the stack in different terminal windows
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
    *)
      # Handle unknown option
      echo "Unknown option: $arg"
      exit 1
      ;;
  esac
done

if $dependencies; then
  concurrently "yarn run compose:deps" "bash setup-elastic-index.sh"
  exit 0
elif $services; then
  yarn dev:secrets:gen
  yarn run start
  exit 0
fi

echo
echo -e "This command starts the OpenCRVS Core development environment, which consists of multiple NodeJS microservices running in parallel.  OpenCRVS requires a companion country configuration server to also be running. \n\nIf you ran our setup command, the country configuration server exists in the directory opencrvs-countryconfig alongside this directory, otherwise you may have cloned or forked it somewhere else.\n\nSo, before we start...\n\n1. Copy this command: \033[32myarn dev \033[0m\n\n2. Create another terminal window.\n\n3. cd into your country config directory and prepare to run the command in that terminal window \033[32mWHEN OPENCRVS CORE HAS FULLY STARTED UP\033[0m\n\nin order to start the country config server and be able to use OpenCRVS.\n\n\033[32mYOU KNOW THAT OPENCRVS CORE HAS FULLY STARTED UP WHEN\033[0m you see automated migrations have completed and you see messages like this: \"\033[32m@opencrvs/migration: │ 20230221121625-create-performance-views.js │ 2023-08-09T15:40:22.284Z\033[0m\" followed by: @opencrvs/components: [0] │   Storybook 7.0.2 for react-vite started\n\n4. If your OpenCRVS database is not seeded, open another terminal window and cd into opencrvs-core.  Run this command in the opencrvs-core directory \033[32mWHEN OPENCRVS CORE HAS FULLY STARTED UP\033[0m in order to seed the database with data: \033[32myarn seed \033[0m\n\n"
echo

sleep 3

# Retrieve 2-step verification to continue
#-----------------------------------------
function ask_yes_or_no() {
    read -p "$1 ([y]es or [N]o): "
    case $(echo $REPLY | tr '[A-Z]' '[a-z]') in
        y|yes) echo "yes" ;;
        *)     echo "no" ;;
    esac
}

if [[ "no" == $(ask_yes_or_no "If you are ready to continue, type: yes.  If you dont know, type: no to exit.") ]]
then
    echo -e "\n\nExiting OpenCRVS."
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
openCRVSPorts=( 3447 9200 5001 5000 9200 27017 6379 8086 4444 3040 5050 2020 7070 9090 1050 3030 3000 3020 2525 2021 3535 3536 9050)
for x in "${openCRVSPorts[@]}"
do
   :
    if lsof -i:$x; then
      echo -e "OpenCRVS thinks that port: $x is in use by another application.\r"
      echo "You need to find out which application is using this port and quit the application."
      echo "You can find out the application by running:"
      echo "lsof -i:$x"
      exit 1
    else
        echo -e "$x \033[32m port is available!\033[0m :)"
    fi
done



echo
echo -e "\033[32m:::::::::: STARTING OPENCRVS ::::::::::\033[0m"
echo
echo "If you did not previously run our setup command, Docker is downloading Mongo DB, ElasticSearch, OpenHIM and Hearth docker images.  These are large files.  Then docker will build them.  If you did run our setup command, OpenCRVS will start much faster. Wait for the OpenCRVS client app to build completely (output will stop and you will see the message: @opencrvs/client: Compiled with warnings.), then OpenCRVS Core will be available."
echo
echo -e "\033[32m:::::::::: PLEASE WAIT for @opencrvs/client ::::::::::\033[0m"
echo
sleep 10

yarn dev:secrets:gen
concurrently "yarn run start" "yarn run compose:deps" "bash setup-elastic-index.sh"
