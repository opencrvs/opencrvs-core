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
 * Rebuilds the Elasticsearch indices from Postgres, then exits.
 * Deployments run this file as a one-off job with the image, environment and
 * secrets of the events service. The exit code is 0 only if the reindex completes.
 */

// Must stay first: the pino instrumentation only patches loggers created after the SDK starts.
import '@opencrvs/commons/monitoring'
import { logger } from '@opencrvs/commons'
import { getCoreSigningKey } from './request-signing'
import { runReindex } from './service/reindex'
import { withReindexLock } from './service/reindex/lock'
import { ensureConnection, resetServer } from './storage/postgres/events'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const appModulePath = require('app-module-path')

appModulePath.addPath(path.join(__dirname, '../'))

async function main() {
  // The event configurations come from country config, which needs signed requests.
  getCoreSigningKey()
  await ensureConnection()

  logger.info('Reindex started')
  await withReindexLock(runReindex)
}

main()
  .then(async () => {
    await resetServer()
    process.exit(0)
  })
  .catch((error: unknown) => {
    logger.error('Reindex failed', error)
    process.exit(1)
  })
