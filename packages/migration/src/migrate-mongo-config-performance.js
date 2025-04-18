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

if (process.env.NODE_ENV === 'production' && !process.env.DASHBOARD_MONGO_URL) {
  throw new Error(
    `Missing environment variable: DASHBOARD_MONGO_URL. Please set it to your Mongo URL of Performance.`
  )
}

const config = {
  mongodb: {
    url: process.env.DASHBOARD_MONGO_URL || 'mongodb://localhost/performance',
    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true // removes a deprecating warning when connecting
    }
  },
  migrationsDir: 'build/dist/src/migrations/performance',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'esm'
}

export default config
