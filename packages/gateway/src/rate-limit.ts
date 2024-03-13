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
import * as client from '@gateway/utils/redis'
import { ApolloError } from 'apollo-server-hapi'
import { GraphQLResolveInfo } from 'graphql'
import { Context } from '@gateway/graphql/context'
import { getUserId, hasScope } from '@gateway/features/user/utils'
import { DISABLE_RATE_LIMIT } from './constants'
import { Lifecycle, ReqRefDefaults } from '@hapi/hapi'
import { get } from 'lodash'
import { userScopes } from '@opencrvs/commons/authentication'

/**
 * Custom RateLimitError. This is being caught in Apollo & Hapi (`onPreResponse` in createServer)
 */
export class RateLimitError extends ApolloError {
  constructor(message: string) {
    super(message, 'RATE_LIMIT_ERROR')
    Object.defineProperty(this, 'name', { value: 'RateLimitError' })
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
    const [requests] = await client.incrementWithTTL(key, TTL_IN_MS)

    if (requests > requestsPerMinute) {
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
      hasScope(
        { Authorization: args[0].headers.authorization },
        userScopes.bypassRateLimit
      )
    ) {
      return fn(...args)
    }

    if (pathForKey) pathOptionsForKey = [pathForKey]

    const route = args[1].request.path
    const payload = JSON.parse(args[0].payload.toString())

    const key = pathOptionsForKey!.find(
      (path) => get(payload, path) !== undefined
    )

    if (!key) {
      throw new Error("Couldn't find a rate limiting key in payload")
    }

    return withRateLimit(
      {
        key: `${key}:${route}`,
        requestsPerMinute
      },
      fn
    )(...args)
  }

export const rateLimitedResolver =
  <A extends [any, any, Context, GraphQLResolveInfo], R>(
    { requestsPerMinute }: { requestsPerMinute: number },
    fn: (...args: A) => R
  ) =>
  (...args: A) => {
    if (hasScope(args[2].headers, userScopes.bypassRateLimit)) {
      return fn(...args)
    }

    const route = args[3].fieldName // e.g. "getUser"
    const userId = getUserId(args[2].headers)

    return withRateLimit(
      {
        key: `${userId}:${route}`,
        requestsPerMinute
      },
      fn
    )(...args)
  }
