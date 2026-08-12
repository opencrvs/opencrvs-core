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
    environment: 'node',
    include: ['src/**/*.test.ts'],
    /**
     * Well above what any assertion here needs. The importability tests load a
     * seeding module through a dynamic `import()`, and the first one pays for
     * transforming `@opencrvs/commons` with it — several seconds on a cold
     * cache, which overruns vitest's five-second default and fails a test that
     * is only ever waiting on the bundler.
     */
    testTimeout: 30_000
  }
})
