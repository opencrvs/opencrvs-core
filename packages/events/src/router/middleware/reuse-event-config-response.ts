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

import {
  MiddlewareFunction,
  MiddlewareResult
} from '@trpc/server/unstable-core-do-not-import'
import { OpenApiMeta } from 'trpc-to-openapi'
import { EventConfig } from '@opencrvs/commons/events'
import { TrpcContext } from '@events/context'
import { env } from '@events/environment'
import { getInMemoryEventConfigurations } from '@events/service/config/config'
import { reuseSerializedResponse } from '@events/router/serialization'

let cached: {
  configurations: EventConfig[]
  result: MiddlewareResult<TrpcContext>
} | null = null

/**
 * Reuses the validated and serialized event configuration response until the
 * in-memory configurations are refetched. Must run before `.output()` so the
 * output validation is skipped too.
 */
export const reuseEventConfigResponse: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext,
  unknown
> = async ({ next, ctx }) => {
  // Configurations are only cached in production.
  if (!env.isProduction) {
    return next()
  }

  const configurations = await getInMemoryEventConfigurations(ctx.token)

  if (cached?.configurations === configurations) {
    return cached.result
  }

  // Runs the rest of the chain: output validation, then the query.
  const result = await next()

  // Keep the validated response and its serialized form for later calls with the same configurations.
  if (result.ok && typeof result.data === 'object' && result.data !== null) {
    reuseSerializedResponse(result.data)
    cached = { configurations, result }
  }

  return result
}
