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

/** Settings that each project needs. Jest does not copy them into projects. */
const project = {
  rootDir: __dirname,
  transform: {
    '^.+\\.tsx?$': [
      '@swc/jest',
      {
        jsc: {
          experimental: {
            plugins: [['@swc-contrib/mut-cjs-exports', {}]]
          }
        }
      }
    ]
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setupJest.ts'],
  modulePaths: ['<rootDir>'],
  moduleNameMapper: {
    '@documents/(.*)': '<rootDir>/src/$1'
  }
}

/**
 * All the tests run once against each store that the README lists as tried
 * and that runs in a container. Run one store only with
 * `pnpm test --selectProjects minio`.
 */
module.exports = {
  testTimeout: 60000,
  globalSetup: './test/global-setup.ts',
  globalTeardown: './test/global-teardown.ts',
  coverageReporters: ['json', 'lcov', 'text', 'html'],
  projects: [
    { ...project, displayName: 'rustfs', globals: { S3_STORE: 'RUSTFS' } },
    { ...project, displayName: 'minio', globals: { S3_STORE: 'MINIO' } }
  ]
}
