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
    echo
    echo -e 'Usage: \033[32mbash setup-resources.sh PATH_TO_OPEN_CRVS_CORE_DIRECTORY\033[0m'
    echo
    echo "PATH_TO_OPEN_CRVS_CORE_DIRECTORY must be provided"
    echo
    echo "Open a terminal window and cd into the opencrvs-core directory. Then type:"
    echo
    echo -e "\033[32mpwd\033[0m"
    echo
    echo "This will display the absolute path to the opencrvs-core directory that must be provided here."
    echo
    exit 1
}

if [ -z "$1" ] ; then
    echo 'Error: Argument PATH_TO_OPEN_CRVS_CORE_DIRECTORY is required in position 1.'
    print_usage_and_exit
fi
PATH_TO_OPEN_CRVS_CORE_DIRECTORY=$1
echo
echo -e "\033[32m::::::::::::::::::::::: Starting OpenCRVS Core :::::::::::::::::::::::\033[0m"
echo
echo -e "\033[32m:::::::: In the terminal on the left OpenCRVS core is starting ::::::::\033[0m"
echo
echo -e "\033[32m:::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::\033[0m"
echo
echo "wait-on auth microservice" && wait-on -l tcp:4040
echo
echo -e "\033[32m:::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::\033[0m"
echo
echo "wait-on notification microservice" && wait-on -l tcp:2020
echo
echo -e "\033[32m:::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::\033[0m"
echo
echo "wait-on gateway microservice" && wait-on -l tcp:7070
echo
echo -e "\033[32m:::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::\033[0m"
echo
echo "wait-on workflow microservice" && wait-on -l tcp:5050
echo
echo -e "\033[32m:::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::\033[0m"
echo
echo "wait-on search microservice" && wait-on -l tcp:9090
echo
echo -e "\033[32m:::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::\033[0m"
echo
echo "wait-on metrics microservice" && wait-on -l tcp:1050
echo
echo -e "\033[32m:::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::\033[0m"
echo
echo "wait-on user-mgnt microservice" && wait-on -l tcp:3030
echo
echo -e "\033[32m:::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::\033[0m"
echo
echo "wait-on OpenCRVS client.  This takes the longest time to build" && wait-on -l http://localhost:3000
echo
echo -e "\033[32m:::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::\033[0m"
echo
echo "wait-on OpenCRVS login client.  This takes the longest time to build" && wait-on -l http://localhost:3020
echo
echo -e "\033[32m:::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::\033[0m"

echo
echo -e "\033[32m:::::::: OpenCRVS Core is running, now we must checkout a config ::::::::\033[0m"
echo
echo -e "\033[32m::::::::::::::: Cloning the Zambia Country Configuration :::::::::::::::\033[0m"
echo

cd ../
git clone https://github.com/opencrvs/opencrvs-zambia.git
cd opencrvs-zambia
echo
echo -e "\033[32m:::::::::::::::::: Installing some Node dependencies ::::::::::::::::::\033[0m"
echo
yarn install
echo
echo -e "\033[32m:::::::::::::::::: Installing Zambia Reference Data ::::::::::::::::::\033[0m"
echo
yarn db:clear:all
yarn db:backup:restore
echo
echo -e "\033[32m::::::::::::::::::::: Starting Zambia Config Server :::::::::::::::::::::\033[0m"
echo
export CERT_PUBLIC_KEY_PATH=$PATH_TO_OPEN_CRVS_CORE_DIRECTORY/.secrets/public-key.pem
echo $CERT_PUBLIC_KEY_PATH
yarn start
