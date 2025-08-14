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

import * as Sentry from '@sentry/node'
import { logger } from '@opencrvs/commons'
import '@opencrvs/commons/monitoring'
import { env } from './environment'
import { getAnonymousToken } from './service/auth'
import { getEventConfigurations } from './service/config/config'
import { ensureIndexExists } from './service/indexing/indexing'
import { server } from './server'

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV
  })
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const appModulePath = require('app-module-path')

appModulePath.addPath(path.join(__dirname, '../'))

export async function main() {
  try {
    const configurations = await getEventConfigurations(
      await getAnonymousToken()
    )
    for (const configuration of configurations) {
      logger.info(`Loaded event configuration: ${configuration.id}`)
      await ensureIndexExists(configuration)
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message)
    }
    if (env.isProd) {
      process.exit(1)
    }
    setTimeout(() => void main(), 5000)
    return
  }
  server().listen(5555)
}

// Execute when the file is run directly e.g. (ts-node -r tsconfig-paths/register src/index.ts)
if (require.main === module) {
  void main()
}
