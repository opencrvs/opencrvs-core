# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

#!/bin/bash

echo 'Initializing Metabase database '

metabase_jar=${METABASE_JAR:-'./metabase.jar'}

metabase_db_path=${MB_DB_FILE:-'/data/metabase/metabase.mv.db'}
metabase_db_path="${metabase_db_path}"
metabase_db_dir="$(dirname $metabase_db_path)"
metabase_db_path_for_metabase=${metabase_db_path%.mv.db}

environment_configuration_sql_file=${OPENCRVS_ENVIRONMENT_CONFIGURATION_SQL_FILE}

##########
#
# Apply environment configuration
#
# This code updates database rows to match the configuration supplied
# as environment variables
#########

echo "Applying environment configuration from $environment_configuration_sql_file"

# Expand $VAR / ${VAR} using bash's own heredoc expansion instead of envsubst,
# because envsubst is not installed in the Metabase image
eval "cat <<OPENCRVS_ENV_EOF
$(cat "$environment_configuration_sql_file")
OPENCRVS_ENV_EOF" > "$environment_configuration_sql_file.tmp"

java -cp "$metabase_jar" org.h2.tools.RunScript -url jdbc:h2:"$metabase_db_path_for_metabase" -script "$environment_configuration_sql_file.tmp"
rm $environment_configuration_sql_file.tmp
