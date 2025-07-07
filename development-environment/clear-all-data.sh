# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
print_usage_and_exit () {
    echo 'Usage: ./clear-all-data.sh'
    echo "This script clears all OpenCRVS data locally."
    exit 1
}

DIR=$(pwd)

# It's fine if these fail as it might be that the databases do not exist at this point
docker run --rm --network=opencrvs_default mongo:4.4 mongo --host mongo1 --eval "\
db.getSiblingDB('hearth-dev').dropDatabase();\
db.getSiblingDB('events').dropDatabase();\
db.getSiblingDB('openhim-dev').dropDatabase();\
db.getSiblingDB('user-mgnt').dropDatabase();\
db.getSiblingDB('application-config').dropDatabase();\
db.getSiblingDB('metrics').dropDatabase();\
db.getSiblingDB('config').dropDatabase();\
db.getSiblingDB('performance').dropDatabase();\
db.getSiblingDB('webhooks').dropDatabase();"

curl -s "http://localhost:9200/_cat/indices?h=index" | while read -r index; do
  echo "Deleting index: $index"
  docker run --rm --network=opencrvs_default appropriate/curl \
    curl -XDELETE "http://elasticsearch:9200/$index" -v
done

docker run --rm --network=opencrvs_default appropriate/curl curl -X POST 'http://influxdb:8086/query?db=ocrvs' --data-urlencode "q=DROP SERIES FROM /.*/" -v
PATH_TO_MINIO_DIR="$DIR/data/minio/ocrvs"
# Clear Minio Data
if [ -d $PATH_TO_MINIO_DIR ] ; then
 # Locally, as this script is called from the country config repo, the path to core is unknown
 # So we delete the data from the running shared volume location
  docker exec `docker ps --format "{{.Names}}" | grep minio` sh -c 'rm -rf /data/ocrvs/*'
  docker exec `docker ps --format "{{.Names}}" | grep minio` mkdir -p /data/ocrvs
  echo "**** Removed minio data ****"
fi

####################
# Clear PostgreSQL #
####################

echo "Resetting schema 'app' in database 'events'..."

docker exec -i postgres psql -U postgres -d events <<EOF
DROP SCHEMA IF EXISTS app CASCADE;
CREATE SCHEMA app AUTHORIZATION events_migrator;
GRANT USAGE ON SCHEMA app TO events_app;
EOF

echo "Schema 'app' dropped and recreated."

##################
# Run migrations #
##################

echo "Running migrations"
echo

pnpm --dir "$DIR/packages/migration" start

echo
