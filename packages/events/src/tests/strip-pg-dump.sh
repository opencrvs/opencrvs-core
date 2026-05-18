#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# Cleans pg_dump output so it can be executed by the Node.js pg client in tests.
#
# Removes two categories of content that break test setup:
#
# 1. psql meta-commands (\restrict, \unrestrict) — added by pg_dump 17 as
#    security bookmarks; valid only in psql, not in the pg Node.js driver.
#
# 2. mongo_fdw extension, server, user mapping, and foreign tables — a legacy
#    FDW that may be present in a developer's local events DB but is not
#    available in the Testcontainers PostgreSQL instance used during tests.

grep -v '^\\' | sed \
  -e '/CREATE SERVER mongo/,/^);$/d' \
  -e '/CREATE FOREIGN TABLE app\.legacy_/,/^);$/d' \
  -e '/mongo_fdw/d' \
  -e '/-- Name: mongo/d' \
  -e '/-- Name: legacy_/d' \
  -e '/ALTER SERVER mongo/d' \
  -e '/ALTER FOREIGN TABLE app\.legacy_/d' \
  -e '/USER MAPPING.*mongo/d' \
  -e '/CREATE USER MAPPING.*mongo/d'
