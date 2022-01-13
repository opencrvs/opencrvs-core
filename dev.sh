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

# Retrieve 2-step verification to continue
#-----------------------------------------
function ask_yes_or_no() {
    read -p "$1 ([y]es or [N]o): "
    case $(echo $REPLY | tr '[A-Z]' '[a-z]') in
        y|yes) echo "yes" ;;
        *)     echo "no" ;;
    esac
}
if [[ "no" == $(ask_yes_or_no "This command starts the OpenCRVS Core development environment.  You must run the country config server separately.  If your country config is already running, type: yes to continue.  If you dont know, type: no to exit.") ]]
then
    echo -e "\n\nExiting OpenCRVS. \n\nIf you ran our setup command, the default Zambia country configuration exists in the directory opencrvs-zambia alongside this one, otherwise you may have cloned or forked it somewhere else.\n\n1. Create another terminal window.\n\n2. cd into your config directory and type: \n\n\033[32myarn dev $DIR\033[0m\n\nWhen your country config is running, return to this terminal window and try again: \n\n\033[32myarn dev\033[0m\n\n"
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
echo "If you did not previously run our setup command, Docker is downloading Mongo DB, ElasticSearch, OpenHIM and Hearth docker images.  These are large files.  Then it will build them.  Wait for the OpenCRVS client app to build completely, then OpenCRVS Core will be available."
echo
echo -e "\033[32m:::::::::: PLEASE WAIT for @opencrvs/client ::::::::::\033[0m"
echo
sleep 10
export LANGUAGES=$1
if [ $OS == "UBUNTU" ]; then
  yarn dev:secrets:gen && concurrently "yarn run start" "yarn run compose:deps"
  else
  export LOCAL_IP=$(ipconfig getifaddr en0)
  yarn dev:secrets:gen && concurrently "yarn run start" "yarn run compose:deps"
fi


