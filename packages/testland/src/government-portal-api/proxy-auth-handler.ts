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
import * as Hapi from '@hapi/hapi'
import { systemClient } from './system-client'
import { logger } from '@countryconfig/logger'
import { env } from '@countryconfig/environment'

type UriResolver = string | ((request: Hapi.Request) => string)

/**
 * Checks if system authentication is configured
 */
const isAuthConfigured = (): boolean =>
  Boolean(env.SYSTEM_CLIENT_ID && env.SYSTEM_CLIENT_SECRET)

/**
 * Resolves the target URI from either a string or function
 */
const resolveUri = (targetUri: UriResolver, request: Hapi.Request): string =>
  typeof targetUri === 'function' ? targetUri(request) : targetUri

/**
 * Creates an unauthenticated proxy response
 */
const createUnauthenticatedProxy = (
  uri: string,
  passThrough: boolean,
  h: Hapi.ResponseToolkit
) => {
  logger.debug(
    'System client credentials not configured, proxying without authentication'
  )
  return h.proxy({ uri, passThrough })
}

/**
 * Adds authentication token to request headers
 */
const addAuthToken = (request: Hapi.Request, token: string): void => {
  request.headers['authorization'] = `Bearer ${token}`
}

/**
 * Creates an authenticated proxy response
 */
const createAuthenticatedProxy = async (
  uri: string,
  passThrough: boolean,
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const token = await systemClient.getToken()
  addAuthToken(request, token)
  return h.proxy({ uri, passThrough })
}

/**
 * Creates an error response for failed authentication
 */
const createAuthErrorResponse = (
  error: unknown,
  h: Hapi.ResponseToolkit
): Hapi.ResponseObject => {
  logger.error('Failed to authenticate proxy request:', error)
  return h
    .response({
      statusCode: 502,
      error: 'Bad Gateway',
      message: 'Failed to authenticate with upstream service'
    })
    .code(502)
}

/**
 * Creates a proxy handler that adds system authentication token to requests
 * @param targetUri The URI to proxy to (string or function that takes request)
 * @param passThrough Whether to pass through request headers
 */
export const createAuthenticatedProxyHandler =
  (targetUri: UriResolver, passThrough: boolean = true) =>
  async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const uri = resolveUri(targetUri, request)

    if (!isAuthConfigured()) {
      return createUnauthenticatedProxy(uri, passThrough, h)
    }

    try {
      return await createAuthenticatedProxy(uri, passThrough, request, h)
    } catch (error) {
      return createAuthErrorResponse(error, h)
    }
  }

/**
 * Creates CORS headers
 */
const corsHeaders = [
  { key: 'Access-Control-Allow-Origin', value: '*' },
  {
    key: 'Access-Control-Allow-Methods',
    value: 'GET, POST, PUT, DELETE, OPTIONS'
  },
  {
    key: 'Access-Control-Allow-Headers',
    value: 'Authorization, Content-Type, Accept, x-correlation-id'
  }
] as const

/**
 * Applies CORS headers to a response
 */
const applyCorsHeaders = (response: Hapi.ResponseObject): Hapi.ResponseObject =>
  corsHeaders.reduce((res, { key, value }) => res.header(key, value), response)

/**
 * Creates a simple OPTIONS handler for CORS preflight requests
 */
export const createCorsOptionsHandler =
  () => (_: Hapi.Request, h: Hapi.ResponseToolkit) =>
    applyCorsHeaders(h.response().code(200))
