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
import pkgUp from 'pkg-up'

function init() {
  if (process.env.NODE_ENV === 'production') {
    const path = pkgUp.sync()

    require('elastic-apm-node').start({
      serviceName:
        process.env.APN_SERVICE_NAME ||
        require(path!).name.replace('@', '').replace('/', '_'),
      serverUrl: process.env.APN_SERVICE_URL || 'http://localhost:8200',
      containerId: process.env.HOSTNAME,
      hostname: process.env.APN_NODE_NAME || require('os').hostname(),
      environment:
        process.env.APN_ENVIRONMENT || process.env.NODE_ENV || 'development'
    })
  }
}
init()
