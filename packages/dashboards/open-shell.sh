#!/bin/bash

MB_DB_FILE=${MB_DB_FILE:-"$(pwd)/data/metabase/metabase.mv.db"}
metabase_jar='./metabase.jar'
metabase_db_path=${MB_DB_FILE:-'/data/metabase/metabase.mv.db'}
metabase_db_path="${metabase_db_path}"
metabase_db_path_for_metabase=${metabase_db_path%.mv.db}


java -cp "$metabase_jar" org.h2.tools.Shell -url jdbc:h2:"$metabase_db_path_for_metabase"