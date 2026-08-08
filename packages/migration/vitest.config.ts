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

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.test.ts'],
    // Provisioning shells out to `run-migrations.sh`, which rewrites the SQL
    // migration files in place (envsubst) before handing them to
    // node-pg-migrate. Two provisions must therefore never overlap.
    fileParallelism: false,
    // Pulling postgres:17.6 and replaying the full migration set is slow.
    testTimeout: 600_000,
    hookTimeout: 600_000,
    globalSetup: ['./src/tests/global-setup.ts']
  }
})
