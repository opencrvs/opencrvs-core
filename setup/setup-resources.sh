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
echo
echo "::::::::::::::::::::::: Starting OpenCRVS Core :::::::::::::::::::::::"
echo
echo ":::::::: In the terminal on the left OpenCRVS core is starting ::::::::"
echo
echo ":::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::"
echo
echo "wait-on auth microservice" && wait-on -l tcp:4040
echo
echo ":::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::"
echo
echo "wait-on notification microservice" && wait-on -l tcp:2020
echo
echo ":::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::"
echo
echo "wait-on gateway microservice" && wait-on -l tcp:7070
echo
echo ":::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::"
echo
echo "wait-on workflow microservice" && wait-on -l tcp:5050
echo
echo ":::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::"
echo
echo "wait-on search microservice" && wait-on -l tcp:9090
echo
echo ":::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::"
echo
echo "wait-on metrics microservice" && wait-on -l tcp:1050
echo
echo ":::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::"
echo
echo "wait-on user-mgnt microservice" && wait-on -l tcp:3030
echo
echo ":::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::"
echo
echo "wait-on OpenCRVS client.  This takes the longest time to build" && wait-on -l http://localhost:3000
echo
echo ":::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::"
echo
echo "wait-on OpenCRVS login client.  This takes the longest time to build" && wait-on -l http://localhost:3020
echo
echo ":::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::"

echo
echo ":::::::: OpenCRVS Core is running, now we must checkout a config ::::::::"
echo
echo "::::::::::::::: Cloning the Zambia Country Configuration :::::::::::::::"
echo
git clone https://github.com/opencrvs/opencrvs-zambia.git
cd opencrvs-zambia
echo
echo ":::::::::::::::::: Installing some Node dependencies ::::::::::::::::::"
echo
yarn install
echo
echo ":::::::::::::::::: Installing Zambia Reference Data ::::::::::::::::::"
echo
yarn db:clear:all
yarn db:backup:restore
echo
echo "::::::::::::::::::::: Starting Zambia Config Server :::::::::::::::::::::"
echo
CERT_PUBLIC_KEY_PATH=./../.secrets/public-key.pem yarn start
