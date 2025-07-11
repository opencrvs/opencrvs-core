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

/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import pkgUp = require('pkg-up')

function init() {
  if (process.env.NODE_ENV === 'production') {
    const path = pkgUp.sync()

    require('elastic-apm-node').start({
      // Override service name from package.json
      // Allowed characters: a-z, A-Z, 0-9, -, _, and space
      serviceName: require(path!).name.replace('@', '').replace('/', '_'),
      // Set custom APM Server URL (default: http://localhost:8200)
      serverUrl: process.env.APN_SERVICE_URL || 'http://localhost:8200',
      // Docker swarm provides this environment variale
      containerId: process.env.HOSTNAME
    })
  }
}
init()
