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

import { logger } from '@opencrvs/commons'
import '@opencrvs/commons/monitoring'
import { createServer, IncomingMessage } from 'http'
import { createHTTPHandler } from '@trpc/server/adapters/standalone'
import {
  createOpenApiHttpHandler,
  generateOpenApiDocument
} from 'trpc-to-openapi'
import { createContext } from './context'
import { appRouter } from './router/router'

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
  onError: ({ req, error }) => {
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

    // If it's a tRPC request, handle it with the tRPC server
    if (isTrpcRequest(req)) {
      trpcServer(req, res)
    } else {
      if (req.url === '/api') {
        const response = generateOpenApiDocument(appRouter, {
          title: 'OpenCRVS API',
          version: '1.8.0',
          baseUrl: 'http://localhost:3000/api/events'
        })

        res.setHeader('Content-Type', 'application/json')
        res.writeHead(200)
        res.end(JSON.stringify(response))
        return
      }
      // If it's a REST request, handle it with the REST server
      void restServer(req, res)
    }
  })
}
