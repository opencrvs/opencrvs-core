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

if [ -z "${OPENCRVS_METABASE_DB_USER}" ]; then
  echo "Error: OPENCRVS_METABASE_DB_USER environment variable is not defined"
  exit 1
fi

if [ -z "${OPENCRVS_METABASE_DB_PASS}" ]; then
  echo "Error: OPENCRVS_METABASE_DB_PASS environment variable is not defined"
  exit 1
fi

if [ -z "${OPENCRVS_METABASE_DB_AUTH_DB}" ]; then
  echo "Error: OPENCRVS_METABASE_DB_AUTH_DB environment variable is not defined"
  exit 1
fi

export MB_JETTY_PORT=${MB_JETTY_PORT:-4444}
export MB_DB_FILE=/data/metabase/metabase.mv.db

source /initialize-database.sh
source /update-database.sh

echo "Starting metabase..."

metabase_db_path=${MB_DB_FILE:-'/data/metabase/metabase.mv.db'}
metabase_db_path="${metabase_db_path}"
metabase_db_path_for_metabase=${metabase_db_path%.mv.db}

MB_DB_FILE=${metabase_db_path_for_metabase} \
MB_DB_TYPE=h2 \
./app/run_metabase.sh
