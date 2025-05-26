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

import { createServer } from 'http'
import { createOpenApiHttpHandler } from 'trpc-to-openapi'
import { TRPCError } from '@trpc/server'
import { createHTTPHandler } from '@trpc/server/adapters/standalone'
import { getUser, logger } from '@opencrvs/commons'
import { getUserId, TokenWithBearer } from '@opencrvs/commons/authentication'
import '@opencrvs/commons/monitoring'
import { env } from './environment'
import { appRouter } from './router/router'
import { getAnonymousToken } from './service/auth'
import { getEventConfigurations } from './service/config/config'
import { ensureIndexExists } from './service/indexing/indexing'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const appModulePath = require('app-module-path')

appModulePath.addPath(path.join(__dirname, '../'))

// When making requests via different clients, the headers are not always in the same format.
// This function normalizes the headers to a consistent format.
function normalizeHeaders(
  headers: Headers | Record<string, string | string[] | undefined>
): Record<string, string> {
  if (headers instanceof Headers) {
    const result: Record<string, string> = {}
    headers.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  return headers as Record<string, string>
}

const trpcConfig: Parameters<typeof createHTTPHandler>[0] = {
  router: appRouter,
  createContext: async function createContext(opts) {
    const normalizedHeaders = normalizeHeaders(opts.req.headers)

    const parseResult = TokenWithBearer.safeParse(
      normalizedHeaders.authorization
    )

    if (!parseResult.success) {
      throw new TRPCError({
        code: 'UNAUTHORIZED'
      })
    }

    const token = parseResult.data
    const userId = getUserId(token)

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED'
      })
    }

    const { primaryOfficeId, role } = await getUser(
      env.USER_MANAGEMENT_URL,
      userId,
      token
    )

    return {
      user: {
        id: userId,
        primaryOfficeId,
        role
      },
      token: token
    }
  }
}
const restServer = createOpenApiHttpHandler(trpcConfig)
const trpcServer = createHTTPHandler(trpcConfig)

// Server which handles both tRPC and REST requests
const server = createServer((req, res) => {
  if (!req.url) {
    res.writeHead(500)
    res.end('No URL provided')
    return
  }
  const url = new URL(req.url, `http://${req.headers.host}`)

  const isTrpcUrl =
    url.search.startsWith('?input') || url.pathname.startsWith('/event.')

  // TODO CIHAN: parempi ratkasu tähän?
  console.log({ isTrpcUrl, url, method: req.method })

  if (isTrpcUrl) {
    trpcServer(req, res)
  } else {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    restServer(req, res)
  }
})

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
    logger.error(error)
    if (env.isProd) {
      process.exit(1)
    }
    /*
     * SIGUSR2 tells nodemon to restart the process without waiting for new file changes
     */
    setTimeout(() => process.kill(process.pid, 'SIGUSR2'), 3000)
    return
  }
  server.listen(5555)
}

void main()
