#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# Dumps the events DB schema from the local PostgreSQL instance and strips
# artifacts that are incompatible with the Testcontainers test environment.
#
# Output: src/tests/postgres-migrations.sql

# pg_dump runs inside a Docker container, so "localhost" refers to the container
# itself rather than the host machine. On macOS, Docker Desktop provides the
# special DNS name host.docker.internal for this. On Linux, Docker creates a
# bridge network (docker0) and assigns the host the gateway IP 172.17.0.1 by
# default, which is how containers reach the host machine.
if [[ $OSTYPE == darwin* ]]; then
  HOST=host.docker.internal
else
  HOST=172.17.0.1
fi

docker run --rm postgres:17.6 pg_dump \
  "postgres://events_migrator:migrator_password@${HOST}:5432/events" \
  -s \
  --exclude-schema=analytics \
  --exclude-schema=reference_data \
  --exclude-table=app.pgmigrations_legacy_data \
  | bash "$(dirname "$0")/strip-pg-dump.sh" \
  > "$(dirname "$0")/postgres-migrations.sql"
