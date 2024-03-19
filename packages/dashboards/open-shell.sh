# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

#!/bin/bash

METABASE_VERSION="v0.46.6.1"
METABASE_JAR="./$METABASE_VERSION-metabase.jar"

MB_DB_FILE=${MB_DB_FILE:-"$(pwd)/data/metabase/metabase.mv.db"}

metabase_db_path=${MB_DB_FILE:-'/data/metabase/metabase.mv.db'}
metabase_db_path="${metabase_db_path}"
metabase_db_path_for_metabase=${metabase_db_path%.mv.db}

java -cp "$METABASE_JAR" org.h2.tools.Shell -url jdbc:h2:"$metabase_db_path_for_metabase"
