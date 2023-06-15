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
# Define the target directory and filename

if [[ "$1" =~ ^create:(hearth|application-config|openhim|performance|user-mgnt)$ ]]; then
  TARGET_FOLDER="${BASH_REMATCH[1]}"
else
  echo "Invalid command. Usage: yarn create:hearth <filename> or yarn create:app <filename>"
  exit 1
fi

if [ -z "$2" ]; then
  echo "Usage: yarn create:hearth <filename> or yarn create:app <filename>"
  exit 1
fi

TIMESTAMP=$(date +"%Y%m%d%H%M%S")

FILENAME="${TIMESTAMP}-${2}"

FILE_PATH="src/migrations/${TARGET_FOLDER}/${FILENAME}.ts"

cat << EOF > "$FILE_PATH"
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import { Db, MongoClient } from 'mongodb'

export const up = async (db: Db, client: MongoClient) => {
    // Add migration logic for applying changes to the database
    // This code will be executed when running the migration
    // It can include creating collections, modifying documents, etc.
}

export const down = async (db: Db, client: MongoClient) => {
    // Add migration logic for reverting changes made by the up() function
    // This code will be executed when rolling back the migration
    // It should reverse the changes made in the up() function
}

EOF

echo "File created: $(pwd)/$FILE_PATH"


