#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

apk add --no-cache minio-client
MINIO_ALIAS=local-cleanup

mcli alias set $MINIO_ALIAS 
http://minio:3535 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

# Figure out buckets to back up
if [ -z "$BUCKETS" ]; then
# All buckets
BUCKETS=$(mcli ls --json $MINIO_ALIAS | jq -r .key | sed 's:/$::')
fi

echo "Cleanup MinIO buckets: $BUCKETS"
for bucket in $BUCKETS; do
  echo "Backing up bucket: $bucket"
  mcli rm --recursive --force $MINIO_ALIAS/$bucket
  mcli rb $MINIO_ALIAS/$bucket
  [ "${make_bucket:-true}" == 'true' ] && mcli mb $MINIO_ALIAS/$bucket
done
