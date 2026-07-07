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
# Removes psql meta-commands (\restrict, \unrestrict) — added by pg_dump 17 as
# security bookmarks; valid only in psql, not in the pg Node.js driver.

grep -v '^\\'
