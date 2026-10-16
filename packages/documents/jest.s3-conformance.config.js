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

/*
 * Runs the object store conformance suite, which talks to a real store and is
 * not part of `pnpm test`. It reuses the unit test transform and path mapping,
 * but not test/setupJest.ts, which replaces the storage client with a mock.
 */

// Jest loads this file as CommonJS, and this package has no ESM config loader
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const { jest: unitTestConfig } = require('./package.json')

module.exports = {
  ...unitTestConfig,
  testRegex: '/test/s3-conformance/.*\\.conformance\\.ts$',
  setupFilesAfterEnv: [],
  testTimeout: 300000
}
