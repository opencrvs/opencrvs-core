#!/bin/bash

echo "Initializing Metabase database"

metabase_jar=${METABASE_JAR:-'./metabase.jar'}

metabase_db_path=${MB_DB_FILE:-'/data/metabase/metabase.mv.db'}
metabase_db_path="${metabase_db_path}"
metabase_db_dir="$(dirname $metabase_db_path)"
metabase_db_path_for_metabase=${metabase_db_path%.mv.db}

if [ -d "$metabase_db_dir" ]; then
  echo " Metabase DB directory: $metabase_db_dir"
else
  mkdir -p "$metabase_db_dir"
  echo " Metabase DB directory created: $metabase_db_dir"
fi

init_sql_file=${MB_DB_INIT_SQL_FILE}

##########
#
# Create an empty database from SQL file
#
#########


if [ -f "$init_sql_file" ]; then
  if [ -f "$metabase_db_path" ]; then
  echo "Database path $metabase_db_path exists, removing it"
  rm $metabase_db_path
  fi

  echo "Creating database $metabase_db_path from $init_sql_file"
  java -cp "$metabase_jar" org.h2.tools.RunScript -url jdbc:h2:"$metabase_db_path_for_metabase" -script "$init_sql_file"
  echo "Database created"
else
  echo "MB_DB_INIT_SQL_FILE $init_sql_file not found, SKIP"
fi

