#!/bin/bash

set -euo pipefail

BASE_DIR="$(dirname "$(dirname "$(realpath "$0")")")"
OUTPUT_DIR="$(dirname "$(realpath "$0")")/src/api-types"

mkdir -p "$OUTPUT_DIR"

# List to keep track of directories
declare -a DIR_LIST

for dir in "$BASE_DIR"/*/; do
  echo "$dir"

  if [[ "$dir" == *"/gateway/"* ]]; then
    continue
  fi

  if [[ -f "${dir}src/server.ts" ]]; then
    DIR_NAME=$(basename "$dir")
    DIR_LIST+=("$DIR_NAME")
    (cd "$dir" && yarn --silent export-json-schema src/server.ts | yarn --silent json2ts --strictIndexSignatures | yarn --silent prettier --stdin-filepath types.ts > "$OUTPUT_DIR/${DIR_NAME}.ts")
  fi
done

# Create src/api-types/index.ts file
INDEX_FILE="$OUTPUT_DIR/index.ts"

cat << EOF > $INDEX_FILE
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
EOF


for dir in "${DIR_LIST[@]}"; do
  CLEANED_DIR_NAME=$(echo "$dir" | tr '-' '_')
  echo "import { HapiRoutes as ${CLEANED_DIR_NAME}Routes } from './${dir}'" >> "$INDEX_FILE"
done

echo -e "\nexport type AllRoutes = {" >> "$INDEX_FILE"
for dir in "${DIR_LIST[@]}"; do
  CLEANED_DIR_NAME=$(echo "$dir" | tr '-' '_')
  echo "  '${dir}': ${CLEANED_DIR_NAME}Routes;" >> "$INDEX_FILE"
done
echo "}" >> "$INDEX_FILE"

yarn prettier --write $INDEX_FILE

