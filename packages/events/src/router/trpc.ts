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

import { initTRPC } from '@trpc/server'
import superjson from 'superjson'
import { OpenApiMeta } from 'trpc-to-openapi'
import { TokenUserType } from '@opencrvs/commons'
import { Context } from './middleware'

export const t = initTRPC.context<Context>().meta<OpenApiMeta>().create({
  transformer: superjson
})

export const router = t.router

export const systemProcedure = t.procedure

export const publicProcedure = t.procedure.use(async (opts) => {
  if (opts.ctx.userType === TokenUserType.SYSTEM) {
    throw new Error('This procedure is only available for human users')
  }
  return opts.next({
    ctx: {
      ...opts.ctx
    }
  })
})
