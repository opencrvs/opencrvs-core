#!/bin/sh
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

yarn
yarn global add wait-on

docker swarm init
sudo mkdir -p data/elasticsearch
sudo chown -R 1000:1000 data/elasticsearch

screen -d -m yarn compose:deps
echo "wait-on tcp:3447" && wait-on -l tcp:3447
echo "wait-on http://localhost:9200" && wait-on -l http://localhost:9200
echo "wait-on tcp:5001" && wait-on -l tcp:5001
echo "wait-on tcp:9200" && wait-on -l tcp:9200
echo "wait-on tcp:27017" && wait-on -l tcp:27017
echo "wait-on tcp:6379" && wait-on -l tcp:6379
echo "wait-on tcp:8086" && wait-on -l tcp:8086

yarn dev:secrets:gen
screen -d -m LANGUAGES=en yarn start
echo "wait-on tcp:4040" && wait-on -l tcp:4040
echo "wait-on http://localhost:3000" && wait-on -l http://localhost:3000
echo "wait-on http://localhost:3020" && wait-on -l http://localhost:3020
echo "wait-on tcp:3030" && wait-on -l tcp:3030
echo "wait-on tcp:2020" && wait-on -l tcp:2020
echo "wait-on tcp:7070" && wait-on -l tcp:7070
echo "wait-on tcp:5050" && wait-on -l tcp:5050
echo "wait-on tcp:9090" && wait-on -l tcp:9090
echo "wait-on tcp:1050" && wait-on -l tcp:1050

# Setup metadata
git clone -b ocrvs-2339 --depth=1 https://github.com/opencrvs/opencrvs-zambia.git
cd opencrvs-zambia
yarn install
yarn db:clear:all
yarn db:backup:restore

screen -dm bash -c 'CERT_PUBLIC_KEY_PATH=./../.secrets/public-key.pem yarn start'
wait-on -l tcp:3040

yarn e2e --record false

killall screen
docker stop $(docker ps -qa)
echo $ROOT_PASSWORD | sudo -S rm -rf data
