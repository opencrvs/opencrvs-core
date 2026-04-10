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
import { redis } from '@gateway/utils/redis'
import { Lifecycle, ReqRefDefaults } from '@hapi/hapi'
import { get } from 'lodash'
import { DISABLE_RATE_LIMIT } from './constants'
import { hasScope } from '@opencrvs/commons'

/**
 * Custom RateLimitError. This is being caught in Apollo & Hapi (`onPreResponse` in createServer)
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
}

interface RateLimitedRouteMultipleOptions {
  requestsPerMinute: number
  pathForKey?: never
  /** Works the same as `pathForKey` but uses the first value that gets resolved of the keys */
  pathOptionsForKey: string[]
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
      pathOptionsForKey
    }: RateLimitedRouteOptions | RateLimitedRouteMultipleOptions,
    fn: (...args: A) => R
  ) =>
  (...args: A) => {
    if (
      args[0].headers.authorization &&
      hasScope(args[0].headers.authorization, 'bypassratelimit')
    ) {
      return fn(...args)
    }

    if (pathForKey) pathOptionsForKey = [pathForKey]

    const route = args[1].request.path
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
