#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

#!/bin/bash

if [ -z "${OPENCRVS_METABASE_SITE_NAME}" ]; then
  echo "Error: OPENCRVS_METABASE_SITE_NAME environment variable is not defined"
  exit 1
fi

if [ -z "${OPENCRVS_ENVIRONMENT_CONFIGURATION_SQL_FILE}" ]; then
  echo "Error: OPENCRVS_ENVIRONMENT_CONFIGURATION_SQL_FILE environment variable is not defined"
  exit 1
fi

if [ -z "${MB_DB_FILE}" ]; then
  echo "Error: MB_DB_FILE environment variable is not defined"
  exit 1
fi

if [ -z "${MB_DB_INIT_SQL_FILE}" ]; then
  echo "Error: MB_DB_INIT_SQL_FILE environment variable is not defined"
  exit 1
fi

if [ -z "${OPENCRVS_METABASE_SITE_URL}" ]; then
  echo "Error: OPENCRVS_METABASE_SITE_URL environment variable is not defined"
  exit 1
fi

if [ -z "${OPENCRVS_METABASE_DB_HOST}" ]; then
  echo "Error: OPENCRVS_METABASE_DB_HOST environment variable is not defined"
  exit 1
fi

if [ -z "${OPENCRVS_METABASE_DB_USER}" ] && [ -z "${OPENCRVS_METABASE_DB_PASS}" ] && [ -z "${OPENCRVS_METABASE_DB_AUTH_DB}" ]; then
  echo "Warning: OPENCRVS_METABASE_DB_USER, OPENCRVS_METABASE_DB_PASS and OPENCRVS_METABASE_DB_AUTH_DB environment variables are not defined"
  echo "Using H2 (Metabase) connection without authentication"
elif [ -z "${OPENCRVS_METABASE_DB_USER}" ]; then
  echo "Error: OPENCRVS_METABASE_DB_USER environment variable is not defined"
  exit 1
elif [ -z "${OPENCRVS_METABASE_DB_PASS}" ]; then
  echo "Error: OPENCRVS_METABASE_DB_PASS environment variable is not defined"
  exit 1
elif [ -z "${OPENCRVS_METABASE_DB_AUTH_DB}" ]; then
  echo "Error: OPENCRVS_METABASE_DB_AUTH_DB environment variable is not defined"
  exit 1
fi

if [ -z "${OPENCRVS_METABASE_MAP_NAME}" ]; then
  echo "Error: OPENCRVS_METABASE_MAP_NAME environment variable is not defined"
  exit 1
fi

if [ -z "${OPENCRVS_METABASE_MAP_URL}" ]; then
  echo "Error: OPENCRVS_METABASE_MAP_URL environment variable is not defined"
  exit 1
fi

if [ -z "${OPENCRVS_METABASE_MAP_REGION_KEY}" ]; then
  echo "Error: OPENCRVS_METABASE_MAP_REGION_KEY environment variable is not defined"
  exit 1
fi

if [ -z "${OPENCRVS_METABASE_MAP_REGION_NAME}" ]; then
  echo "Error: OPENCRVS_METABASE_MAP_REGION_NAME environment variable is not defined"
  exit 1
fi

if [ -z "${OPENCRVS_METABASE_ADMIN_EMAIL}" ]; then
  echo "Error: OPENCRVS_METABASE_ADMIN_EMAIL environment variable is not defined"
  exit 1
fi

if [ -z "${OPENCRVS_METABASE_ADMIN_PASSWORD}" ]; then
  echo "Error: OPENCRVS_METABASE_ADMIN_PASSWORD environment variable is not defined"
  exit 1
fi

export MB_JETTY_PORT=${MB_JETTY_PORT:-4444}
export MB_DB_FILE=${MB_DB_FILE:-'/data/metabase/metabase.mv.db'}
export OPENCRVS_METABASE_ADMIN_PASSWORD_SALT=$(uuidgen)
SALT_AND_PASSWORD=$OPENCRVS_METABASE_ADMIN_PASSWORD_SALT$OPENCRVS_METABASE_ADMIN_PASSWORD
export OPENCRVS_METABASE_ADMIN_PASSWORD_HASH=$(java -cp $METABASE_JAR clojure.main -e "(require 'metabase.util.password) (println (metabase.util.password/hash-bcrypt \"$SALT_AND_PASSWORD\"))" 2>/dev/null | tail -n 1)

source /initialize-database.sh
source /update-database.sh

echo "Starting metabase..."

metabase_db_path=${MB_DB_FILE:-'/data/metabase/metabase.mv.db'}
metabase_db_path="${metabase_db_path}"
metabase_db_path_for_metabase=${metabase_db_path%\/metabase.mv.db}

MB_DB_FILE=${metabase_db_path_for_metabase} \
MB_DB_TYPE=h2 \
./app/run_metabase.sh
