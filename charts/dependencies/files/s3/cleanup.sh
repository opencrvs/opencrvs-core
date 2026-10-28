#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

. /scripts/ensure-alpine-utils.sh

ensure_alpine_utils || exit 1
S3_ALIAS=local-cleanup

mcli alias set "$S3_ALIAS" "$S3_ENDPOINT" "$S3_ADMIN_ACCESS_KEY" "$S3_ADMIN_SECRET_KEY"

# Figure out buckets to back up
if [ -z "$BUCKETS" ]; then
# All buckets
BUCKETS=$(mcli ls --json "$S3_ALIAS" | jq -r .key | sed 's:/$::')
fi

echo "Cleanup S3 buckets: $BUCKETS"
for bucket in $BUCKETS; do
  echo "Backing up bucket: $bucket"
  mcli rm --recursive --force "$S3_ALIAS/$bucket"
  mcli rb "$S3_ALIAS/$bucket"
  [ "${make_bucket:-true}" = "true" ] && mcli mb "$S3_ALIAS/$bucket"
done
