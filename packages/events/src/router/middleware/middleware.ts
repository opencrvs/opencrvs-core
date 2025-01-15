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

import { inScope, Scope, TokenWithBearer, userScopes } from '@opencrvs/commons'
import { TRPCError, AnyTRPCMiddlewareFunction } from '@trpc/server'

import { z } from 'zod'

const ContextSchema = z.object({
  user: z.object({
    id: z.string(),
    primaryOfficeId: z.string()
  }),
  token: z.string() as z.ZodType<TokenWithBearer>
})

export type Context = z.infer<typeof ContextSchema>

/**
 * TRPC Middleware options with correct context.
 * Actual middleware type definition is only for internal use within TRPC.
 */
type MiddlewareOptions = Omit<
  Parameters<AnyTRPCMiddlewareFunction>[0],
  'ctx'
> & { ctx: Context }

/**
 * @param scopes scopes that are allowed to access the resource
 * @returns TRPC compatible middleware function
 */
const createScopeAuthMiddleware =
  (scopes: Scope[]) => (opts: MiddlewareOptions) => {
    if (inScope({ Authorization: opts.ctx.token }, scopes)) {
      return opts.next()
    }

    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

const isNationalSystemAdminUser = createScopeAuthMiddleware([
  userScopes.nationalSystemAdmin
])

export const middleware = {
  isNationalSystemAdminUser
}
