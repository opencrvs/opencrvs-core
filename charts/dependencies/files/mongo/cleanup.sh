#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

DATABASES=${DATABASES:-"hearth-dev events user-mgnt metrics performance"}
echo "Running cleanup"
if [ ! -z ${MONGODB_ADMIN_USER+x} ] && [ ! -z ${MONGODB_ADMIN_PASSWORD+x} ]; then
  AUTH="--username $MONGODB_ADMIN_USER --password $MONGODB_ADMIN_PASSWORD --authenticationDatabase admin";
else
  AUTH="";
fi
for DB in $DATABASES; do
  echo "Dropping database: $DB"
  mongo $AUTH --host $MONGODB_HOST --eval "db.getSiblingDB('$DB').dropDatabase()"
done
echo "Cleanup complete!"