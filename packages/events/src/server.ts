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
import { appRouter } from './router/router'
import { createContext } from './context'

const trpcConfig: Parameters<typeof createHTTPHandler>[0] = {
  router: appRouter,
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
      // If it's a REST request, handle it with the REST server
      void restServer(req, res)
    }
  })
}
