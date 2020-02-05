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

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
./node_modules/.bin/ts-node rebuild-only-changed-images.ts
yarn global add wait-on
yarn dev:secrets:gen
docker swarm init
sudo mkdir -p data/elasticsearch
sudo chown -R 1000:1000 data/elasticsearch
yarn compose:all &
wait-on tcp:4040 tcp:3030 tcp:2020 tcp:7070 tcp:5050 tcp:9090 tcp:3040 tcp:1050 http://localhost:3000 http://localhost:3001 http://localhost:3020 tcp:27017 tcp:6379 tcp:9200 http://localhost:9200 tcp:8086 http://localhost:8086/ping tcp:3447 tcp:5001


# Setup metadata
git clone git@github.com:opencrvs/opencrvs-bangladesh.git
cd opencrvs-bangladesh
yarn install
yarn db:clear:all
yarn db:backup:restore
yarn save:testData && cd ..

cd packages/e2e && yarn start