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

import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { OpenApiMeta } from 'trpc-to-openapi'
import { logger, TokenUserType } from '@opencrvs/commons'
import { TrpcContext } from '@events/context'
import { env } from '@events/environment'

export const t = initTRPC
  .context<TrpcContext>()
  .meta<OpenApiMeta>()
  .create({
    transformer: superjson,
    errorFormatter: ({ shape, error }) => {
      // If received unhandled error, don't leak the error message or stack trace in the response.
      // This is a security measure: the message or stack trace could contain internal technical details etc. sensitive information.
      if (error.code === 'INTERNAL_SERVER_ERROR' && env.isProduction) {
        return {
          ...shape,
          message: 'Internal server error',
          data: { code: shape.data.code, httpStatus: shape.data.httpStatus }
        }
      }

      // Keep all other errors as is.
      return shape
    }
  })

export const router = t.router

/**
 * System procedures are available to both system (API key) users and
 * human users depending on the scopes they have
 */
export const systemProcedure = t.procedure

/**
 * Public procedures are only available to human users
 * and will throw an error if a system user tries to access them
 */
export const publicProcedure = t.procedure.use(async (opts) => {
  const { user } = opts.ctx

  if (user.type === TokenUserType.enum.system) {
    logger.error(
      `System user tried to access public procedure. User id: '${user.id}'`
    )
    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  return opts.next({
    ctx: {
      ...opts.ctx,
      user
    }
  })
})
