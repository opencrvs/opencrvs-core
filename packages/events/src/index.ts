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

import { createServer, IncomingMessage } from 'http'
import { createOpenApiHttpHandler } from 'trpc-to-openapi'
import { TRPCError } from '@trpc/server'
import { createHTTPHandler } from '@trpc/server/adapters/standalone'
import { getUser, logger } from '@opencrvs/commons'
import {
  getUserId,
  getUserTypeFromToken,
  TokenUserType,
  TokenWithBearer
} from '@opencrvs/commons/authentication'
import '@opencrvs/commons/monitoring'
import { env } from './environment'
import { appRouter } from './router/router'
import { getAnonymousToken } from './service/auth'
import { getEventConfigurations } from './service/config/config'
import { ensureIndexExists } from './service/indexing/indexing'
import { UserDetails } from './router/middleware'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const appModulePath = require('app-module-path')

appModulePath.addPath(path.join(__dirname, '../'))

// When making requests via different clients, the headers are not always in the same format.
// This function normalizes the headers to a consistent format.
function normalizeHeaders(
  headers: Headers | Record<string, string | string[] | undefined>
): Record<string, string | string[] | undefined> {
  return headers instanceof Headers
    ? Object.fromEntries(headers.entries())
    : headers
}

function stringifyRequest(req: IncomingMessage) {
  const url = new URL(req.url || '', `http://${req.headers.host}`)
  return `'${req.method} ${url.pathname}'`
}

async function resolveUserDetails(
  token: `Bearer ${string}`
): Promise<UserDetails> {
  const sub = getUserId(token)

  if (!sub) {
    throw new TRPCError({
      code: 'UNAUTHORIZED'
    })
  }

  const userType = getUserTypeFromToken(token)

  if (userType === TokenUserType.SYSTEM) {
    return {
      userType: TokenUserType.SYSTEM,
      user: {
        id: sub,
        primaryOfficeId: undefined,
        role: 'TODO'
      }
    }
  }

  const { primaryOfficeId, role } = await getUser(
    env.USER_MANAGEMENT_URL,
    sub,
    token
  )

  return {
    userType: TokenUserType.USER,
    user: {
      id: sub,
      primaryOfficeId,
      role
    }
  }
}

const trpcConfig: Parameters<typeof createHTTPHandler>[0] = {
  router: appRouter,
  middleware: (req, _, next) => {
    logger.info(`Request: ${stringifyRequest(req)}`)
    return next()
  },
  onError: ({ req, error }) =>
    logger.warn(
      `Error for request: ${stringifyRequest(req)}. Error: '${error.message}'`,
      error.stack
    ),
  createContext: async function createContext(opts) {
    const { authorization } = normalizeHeaders(opts.req.headers)
    const parseResult = TokenWithBearer.safeParse(authorization)

    if (!parseResult.success) {
      throw new TRPCError({
        code: 'UNAUTHORIZED'
      })
    }

    const token = parseResult.data

    return { token, ...(await resolveUserDetails(token)) }
  }
}

// Check if the request is a tRPC request
function isTrpcRequest(req: IncomingMessage) {
  if (!req.url) {
    throw new Error('No URL provided')
  }

  const url = new URL(req.url, `http://${req.headers.host}`)
  const pathName = url.pathname.replace(/^\//, '') // Remove leading slash
  const trpcProcedurePaths = Object.keys(appRouter._def.procedures)

  return (
    url.search.startsWith('?input') || trpcProcedurePaths.includes(pathName)
  )
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

  // If it's a tRPC request, handle it with the tRPC server
  if (isTrpcRequest(req)) {
    trpcServer(req, res)
  } else {
    // If it's a REST request, handle it with the REST server
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
