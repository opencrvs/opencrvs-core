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
import { readFileSync } from 'fs'
import { redis } from '@gateway/utils/redis'
import { Lifecycle, ReqRefDefaults } from '@hapi/hapi'
import { get } from 'lodash'
import jwt from 'jsonwebtoken'
import { CERT_PUBLIC_KEY_PATH, DISABLE_RATE_LIMIT } from './constants'
import { hasScope } from '@opencrvs/commons'

const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

/**
 * Routes wrapped by `rateLimitedRoute` are declared with `auth: false`, so
 * Hapi's verified `jwt` strategy (see server.ts) never runs on them. Reading
 * scopes off the token via `hasScope`/`jwt-decode` alone is therefore not
 * safe here — `decode` only base64-decodes the payload without checking the
 * signature, so anyone could forge a `{"scope":["bypassratelimit"]}` token
 * and disable rate limiting on login/OTP endpoints. Verify the signature,
 * issuer and audience ourselves before trusting the scope.
 */
const hasVerifiedBypassScope = (authorizationHeader: string): boolean => {
  const token = authorizationHeader.replace(/^Bearer\s+/i, '')
  try {
    jwt.verify(token, publicCert, {
      algorithms: ['RS256'],
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:gateway-user'
    })
  } catch {
    return false
  }
  return hasScope(authorizationHeader, 'bypassratelimit')
}

/**
 * Custom RateLimitError. This is being caught in Hapi (`onPreResponse` in createServer)
 */
export class RateLimitError extends Error {
  constructor(message = 'You are being rate limited') {
    super(message)
  }
}

interface RouteOptions {
  /** Unique key which is used to group requests to allow to limit */
  key: string
  /** Maximum number of requests within a minute */
  requestsPerMinute: number
}

/** Time to live in milliseconds for every Redis entry */
const TTL_IN_MS = 60 * 1000

const withRateLimit = <A extends any[], R>(
  { key, requestsPerMinute }: RouteOptions,
  fn: (...args: A) => R
) => {
  if (DISABLE_RATE_LIMIT) {
    return fn
  }

  return async function (...args: A) {
    const [requests] = await redis
      .multi()
      .incr(key)
      .pExpire(key, TTL_IN_MS)
      .exec()

    const requestsNumber = Number(requests)

    if (requestsNumber > requestsPerMinute) {
      throw new RateLimitError(
        'Too many requests within a minute. Please throttle your requests.'
      )
    }

    return fn(...args)
  }
}

interface RateLimitedRouteOptions {
  requestsPerMinute: number
  /** e.g. "username" or "user.name" */
  pathForKey: string
  pathOptionsForKey?: never
  staticKey?: never
}

interface RateLimitedRouteMultipleOptions {
  requestsPerMinute: number
  pathForKey?: never
  /** Works the same as `pathForKey` but uses the first value that gets resolved of the keys */
  pathOptionsForKey: string[]
  staticKey?: never
}

interface RateLimitedRouteStaticKeyOptions {
  requestsPerMinute: number
  pathForKey?: never
  pathOptionsForKey?: never
  /**
   * A constant key to rate limit on, used when the payload has no
   * per-user field to key on (e.g. super user auth only sends a password).
   */
  staticKey: string
}

export const rateLimitedRoute =
  <
    A extends Parameters<
      Lifecycle.Method<ReqRefDefaults, Lifecycle.ReturnValue<ReqRefDefaults>>
    >,
    R
  >(
    {
      requestsPerMinute,
      pathForKey,
      pathOptionsForKey,
      staticKey
    }:
      | RateLimitedRouteOptions
      | RateLimitedRouteMultipleOptions
      | RateLimitedRouteStaticKeyOptions,
    fn: (...args: A) => R
  ) =>
  (...args: A) => {
    if (
      args[0].headers.authorization &&
      hasVerifiedBypassScope(args[0].headers.authorization as string)
    ) {
      return fn(...args)
    }

    const route = args[1].request.path

    if (staticKey) {
      return withRateLimit(
        {
          key: `${staticKey}:${route}`,
          requestsPerMinute
        },
        fn
      )(...args)
    }

    if (pathForKey) pathOptionsForKey = [pathForKey]

    const payload = JSON.parse(args[0].payload.toString())

    const key = pathOptionsForKey!.find(
      (path) => get(payload, path) !== undefined
    )
    const value = get(payload, key!)

    if (!value) {
      throw new Error(
        "Couldn't find the value for a rate limiting key in payload"
      )
    }

    return withRateLimit(
      {
        key: `${value}:${route}`,
        requestsPerMinute
      },
      fn
    )(...args)
  }
