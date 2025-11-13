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
import { createHTTPHandler } from '@trpc/server/adapters/standalone'
import '@opencrvs/commons/monitoring'
import { logger } from '@opencrvs/commons'
import { appRouter } from './router/router'
import { createContext } from './context'
import { handleHealthCheckResponse } from './service/health'

function stringifyRequest(req: IncomingMessage) {
  const url = new URL(req.url || '', `http://${req.headers.host}`)
  return `'${req.method} ${url.pathname}'`
}

const trpcConfig: Parameters<typeof createHTTPHandler>[0] = {
  router: appRouter,
  middleware: (req, _, next) => {
    logger.info(`Request: ${stringifyRequest(req)}`)
    return next()
  },
  onError: ({ error, req }) => {
    logger.warn(
      `Error for request: ${stringifyRequest(req)}. Error: '${error.message}'`
    )
  },
  createContext
}

function isTrpcRequest(req: IncomingMessage): boolean {
  if (!req.url) {
    throw new Error('No URL provided')
  }
  const url = new URL(req.url, `http://${req.headers.host}`)
  const pathName = url.pathname.replace(/^\//, '')
  const trpcProcedurePaths = Object.keys(appRouter._def.procedures)

  return (
    url.search.startsWith('?input') || trpcProcedurePaths.includes(pathName)
  )
}

export function server() {
  const restServer = createOpenApiHttpHandler(trpcConfig)
  const trpcServer = createHTTPHandler(trpcConfig)

  return createServer((req, res) => {
    if (!req.url) {
      res.writeHead(500)
      res.end('No URL provided')
      return
    }

    if (req.url === '/ping') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok' }))
      return
    }

    if (req.url === '/health/ready') {
      void handleHealthCheckResponse(res)
      return
    }

    // If it's a tRPC request, handle it with the tRPC server
    if (isTrpcRequest(req)) {
      trpcServer(req, res)
    } else {
      // If it's a REST request, handle it with the REST server
      // Ensure Content-Type is set, otherwise default to JSON. Fixes trpc-to-openapi crashing as it only supports 'application/json'
      if (!req.headers['content-type']) {
        req.headers['content-type'] = 'application/json'
      }
      void restServer(req, res)
    }
  })
}
