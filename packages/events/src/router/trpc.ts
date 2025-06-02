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
import { Context } from './middleware'

export const t = initTRPC.context<Context>().meta<OpenApiMeta>().create({
  transformer: superjson
})

export const router = t.router

/*
 * System procedures are available to both system (API key) users and
 * human users depending on the scopes they have
 */
export const systemProcedure = t.procedure

/*
 * Public procedures are only available to human users
 * and will throw an error if a system user tries to access them
 */
export const publicProcedure = t.procedure.use(async (opts) => {
  if (opts.ctx.user.type === TokenUserType.SYSTEM) {
    logger.error(
      `System user tried to access public procedure. User id: '${opts.ctx.user.id}'`
    )
    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  return opts.next({ ctx: opts.ctx })
})
