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
yarn build:image && docker-compose -p opencrvs -f docker-compose.yml -f docker-compose.ci.yml -f docker-compose.deps.yml -f docker-compose.dev-deps.yml -f docker-compose.dev.yml up -d && echo "wait-on tcp:4040" && wait-on -l tcp:4040 && echo "wait-on tcp:3030" && wait-on -l tcp:3030 && echo "wait-on tcp:2020" && wait-on -l tcp:2020 && echo "wait-on tcp:7070" && wait-on -l tcp:7070 && echo "wait-on tcp:5050" && wait-on -l tcp:5050 && echo "wait-on tcp:9090" && wait-on -l tcp:9090 && echo "wait-on tcp:3040" && wait-on -l tcp:3040 && echo "wait-on tcp:1050" && wait-on -l tcp:1050 && echo "wait-on tcp:3447" && wait-on -l tcp:3447 && echo "wait-on tcp:5001" && wait-on -l tcp:5001 && echo "wait-on tcp:27017" && wait-on -l tcp:27017 && echo "wait-on tcp:6379" && wait-on -l tcp:6379 && echo "wait-on tcp:9200" && wait-on -l tcp:9200 && echo "wait-on http://localhost:9200" && wait-on -l http://localhost:9200 && echo "wait-on tcp:8086" && wait-on -l tcp:8086 && echo "wait-on http://localhost:8086/ping" && wait-on -l http://localhost:8086/ping && echo "wait-on http://localhost:3000" && wait-on -l http://localhost:3000 && echo "wait-on http://localhost:3020" && wait-on -l http://localhost:3020



# Setup metadata
git clone https://github.com/opencrvs/opencrvs-farajaland.git
cd opencrvs-farajaland
yarn install
yarn db:clear:all
yarn db:backup:restore
yarn e2e --record false
