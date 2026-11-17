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

import { randomUUID } from 'crypto'
import { createServer, IncomingMessage } from 'http'
import { pinoHttp } from 'pino-http'
import { createOpenApiHttpHandler } from 'trpc-to-openapi'
import { createHTTPHandler } from '@trpc/server/adapters/standalone'
import '@opencrvs/commons/monitoring'
import { logger } from '@opencrvs/commons'
import { appRouter } from './router/router'
import { createContext, createServiceContext } from './context'
import { handleHealthCheckResponse } from './service/health'
import { internalRouter } from './router/internalRouter'
import { initialisationRouter } from './router/initialisation'

const HEALTH_CHECK_PATHS = ['/ping', '/health/ready']

function pathnameOf(req: IncomingMessage) {
  const url = new URL(req.url || '', `http://${req.headers.host}`)
  return url.pathname
}

function stringifyRequest(req: IncomingMessage) {
  return `'${req.method} ${pathnameOf(req)}'`
}

/**
 * Logs every request once it has been responded to, with method, url, status
 * code and response time. Health check probes are logged at debug level so
 * they stay out of production logs.
 */
const httpLogger =
  process.env.NODE_ENV === 'production'
    ? pinoHttp({
        logger,
        genReqId: (req) =>
          req.headers['x-correlation-id']?.toString() ?? randomUUID(),
        // NOTE: pino-http@7 types customLogLevel as taking the request, but
        // never passes it. Read it off the response instead.
        customLogLevel: (_, res) => {
          if (HEALTH_CHECK_PATHS.includes(pathnameOf(res.req))) {
            return 'debug'
          }
          if (res.statusCode >= 500) {
            return 'error'
          }
          return res.statusCode >= 400 ? 'warn' : 'info'
        }
      })
    : null

const trpcConfig: Parameters<typeof createHTTPHandler>[0] = {
  router: appRouter,
  allowBatching: true,
  allowMethodOverride: true,
  onError: ({ error, req }) => {
    logger.warn(
      `Error for request: ${stringifyRequest(req)}. Error: '${error.message}'`
    )
  },
  createContext
}

// NOTE: This will not work without both trailing and leading slashes.
const INTERNAL_TRPC_ROUTER_PREFIX = '/internal/'
const INITIALISATION_TRPC_ROUTER_PREFIX = '/initialisation/'

const internalTrpcConfig: Parameters<typeof createHTTPHandler>[0] = {
  router: internalRouter,
  basePath: INTERNAL_TRPC_ROUTER_PREFIX,
  onError: ({ error, req }) => {
    logger.warn(
      `Error for internal request: ${stringifyRequest(req)}. Error: '${error.message}'`
    )
  },
  createContext: createServiceContext
}

const initialisationTrpcConfig: Parameters<typeof createHTTPHandler>[0] = {
  router: initialisationRouter,
  basePath: INITIALISATION_TRPC_ROUTER_PREFIX,
  onError: ({ error, req }) => {
    logger.warn(
      `Error for initialisation request: ${stringifyRequest(req)}. Error: '${error.message}'`
    )
  },
  createContext: createServiceContext
}

function isAppTrpcRequest(req: IncomingMessage): boolean {
  if (!req.url) {
    throw new Error('No URL provided')
  }
  const url = new URL(req.url, `http://${req.headers.host}`)

  const pathName = url.pathname.replace(/^\//, '')
  const trpcProcedurePaths = Object.keys(appRouter._def.procedures)

  return (
    url.search.startsWith('?batch') ||
    url.search.startsWith('?input') ||
    trpcProcedurePaths.includes(pathName)
  )
}

function isInternalTrpcRequest(req: IncomingMessage): boolean {
  if (!req.url) {
    throw new Error('No URL provided')
  }
  const url = new URL(req.url, `http://${req.headers.host}`)

  return url.pathname.startsWith(INTERNAL_TRPC_ROUTER_PREFIX)
}

function isInitialisationTrpcRequest(req: IncomingMessage): boolean {
  if (!req.url) {
    throw new Error('No URL provided')
  }
  const url = new URL(req.url, `http://${req.headers.host}`)

  return url.pathname.startsWith(INITIALISATION_TRPC_ROUTER_PREFIX)
}

export function server() {
  const restServer = createOpenApiHttpHandler(trpcConfig)
  const trpcServer = createHTTPHandler(trpcConfig)
  const internalTrpcServer = createHTTPHandler(internalTrpcConfig)
  const initialisationTrpcServer = createHTTPHandler(initialisationTrpcConfig)

  return createServer((req, res) => {
    httpLogger?.(req, res)

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

    // Handle multipart/form-data uploads for the attachments endpoint
    if (
      req.method === 'POST' &&
      req.url.startsWith('/attachments') &&
      (req.headers['content-type'] ?? '').startsWith('multipart/form-data')
    ) {
      req.url = '/attachments.upload'
      void trpcServer(req, res)
      return
    }

    // If it's a tRPC request, handle it with the tRPC server. Discriminate between routes.
    if (isInternalTrpcRequest(req)) {
      internalTrpcServer(req, res)
    } else if (isInitialisationTrpcRequest(req)) {
      initialisationTrpcServer(req, res)
    } else if (isAppTrpcRequest(req)) {
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
