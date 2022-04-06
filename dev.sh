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
DIR=$(cd "$(dirname "$0")"; pwd)

echo
echo -e "This command starts the OpenCRVS Core development environment, which consists of multiple NodeJS microservices running in parallel.  OpenCRVS requires a companion country configuration server to also be running. \n\nIf you ran our setup command, the fictional Farajaland country configuration server exists in the directory opencrvs-farajaland alongside this directory, otherwise you may have cloned or forked it somewhere else.\n\nYour country configuration server must understand the path to the directory where OpenCRVS Core is located.\n\nSo, before we start...\n\n1. Copy this command: \033[32myarn dev $DIR\033[0m\n\n2. Create another terminal window.\n\n3. cd into your country config directory and prepare to paste the command, \033[32mWHEN OPENCRVS CORE HAS FULLY STARTED UP\033[0m, in order to start the country config server and be able to use OpenCRVS.\n\nYou know OpenCRVS Core is ready for you to start the country configuration server, when you see this message: \"\033[32m@opencrvs/client: Compiled with warnings.\033[0m\" followed by any NPM dependency warnings."
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
if [[ $(docker ps -aq) ]] ; then docker stop $(docker ps -aq) ; fi

if [  -n "$(uname -a | grep Ubuntu)" ]; then
  OS="UBUNTU"
  else
  OS="MAC"
fi
echo
echo -e "\033[32m:::::::::: STARTING OPENCRVS ::::::::::\033[0m"
echo
echo "If you did not previously run our setup command, Docker is downloading Mongo DB, ElasticSearch, OpenHIM and Hearth docker images.  These are large files.  Then docker will build them.  If you did run our setup command, OpenCRVS will start much faster. Wait for the OpenCRVS client app to build completely (output will stop and you will see the message: @opencrvs/client: Compiled with warnings.), then OpenCRVS Core will be available."
echo
echo -e "\033[32m:::::::::: PLEASE WAIT for @opencrvs/client ::::::::::\033[0m"
echo
sleep 10
export LANGUAGES="en"
if [ $OS == "UBUNTU" ]; then
  yarn dev:secrets:gen && concurrently "yarn run start" "yarn run compose:deps"
  else
  export LOCAL_IP=host-gateway
  yarn dev:secrets:gen && concurrently "yarn run start" "yarn run compose:deps"
fi


