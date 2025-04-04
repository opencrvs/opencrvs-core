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

import { TRPCError } from '@trpc/server'
import { inScope, Scope } from '@opencrvs/commons'
import { MiddlewareOptions } from '@events/router/middleware/utils'

/**
 * Depending on how the API is called, there might or might not be Bearer keyword in the header.
 * To allow for usage with both direct HTTP calls and TRPC, ensure it's present to be able to use shared scope auth functions.
 */
export function setBearerForToken(token: string) {
  const bearer = 'Bearer'

  return token.startsWith(bearer) ? token : `${bearer} ${token}`
}

/**
 * Middleware which checks that one of the required scopes are present in the token.
 *
 * @param scopes scopes that are required to access the resource
 * @returns TRPC compatible middleware function
 */
export function requiresAnyOfScopes(scopes: Scope[]) {
  return async (opts: MiddlewareOptions) => {
    if (inScope({ Authorization: setBearerForToken(opts.ctx.token) }, scopes)) {
      return opts.next()
    }

    throw new TRPCError({ code: 'FORBIDDEN' })
  }
}
