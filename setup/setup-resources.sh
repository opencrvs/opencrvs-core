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
echo "wait-on tcp:4040" && wait-on -l tcp:4040
echo "wait-on http://localhost:3000" && wait-on -l http://localhost:3000
echo "wait-on http://localhost:3020" && wait-on -l http://localhost:3020
echo "wait-on tcp:3030" && wait-on -l tcp:3030
echo "wait-on tcp:2020" && wait-on -l tcp:2020
echo "wait-on tcp:7070" && wait-on -l tcp:7070
echo "wait-on tcp:5050" && wait-on -l tcp:5050
echo "wait-on tcp:9090" && wait-on -l tcp:9090
echo "wait-on tcp:1050" && wait-on -l tcp:1050


echo
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
