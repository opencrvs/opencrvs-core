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

import { experimental_standaloneMiddleware, TRPCError } from '@trpc/server'
import { MiddlewareFunction } from '@trpc/server/unstable-core-do-not-import'
import {
  ActionDocument,
  ActionInputWithType,
  ActionType,
  DeleteActionInput,
  getAssignedUserFromActions,
  getScopes,
  inScope,
  Scope,
  findScope,
  ConfigurableScopeType,
  ConfigurableScopes,
  IAuthHeader
} from '@opencrvs/commons'
import { Context } from '@events/router/middleware/utils'
import { getEventById } from '@events/service/events/events'

/**
 * Depending on how the API is called, there might or might not be Bearer keyword in the header.
 * To allow for usage with both direct HTTP calls and TRPC, ensure it's present to be able to use shared scope auth functions.
 */
export function setBearerForToken(token: string) {
  const bearer = 'Bearer'

  return token.startsWith(bearer) ? token : `${bearer} ${token}`
}

function getAuthorizedCtx(foundScopes: ConfigurableScopes[]) {
  const authorizedEvents = foundScopes
    .flatMap(({ options }) => {
      if ('event' in options) {
        return options.event
      }

      return undefined
    })
    .filter((event) => event !== undefined)

  // TODO CIHAN: add all events if not authorized events are present?
  return {
    ...(authorizedEvents.length > 0 && { events: authorizedEvents })
  }
}

// TODO CIHAN: comment
function inConfigurableScopes(
  authHeader: IAuthHeader,
  configurableScopes: ConfigurableScopeType[]
) {
  const userScopes = getScopes(authHeader)
  const foundScopes = configurableScopes
    .map((scope) => findScope(userScopes, scope))
    .filter((scope) => scope !== undefined)

  if (!foundScopes.length) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  return getAuthorizedCtx(foundScopes)
}

/**
 * Middleware which checks that one of the required scopes are present in the token.
 *
 * @param scopes scopes that are required to access the resource
 * @returns TRPC compatible middleware function
 */
export function requiresAnyOfScopes(
  scopes: Scope[],
  configurableScopes?: ConfigurableScopeType[]
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fn: MiddlewareFunction<any, any, any, any, any> = async (opts) => {
    const token = setBearerForToken(opts.ctx.token)
    const authHeader = { Authorization: token }

    if (inScope(authHeader, scopes)) {
      return opts.next()
    }

    if (configurableScopes) {
      const authorizedEntities = inConfigurableScopes(
        authHeader,
        configurableScopes
      )

      return opts.next({
        ...opts,
        ctx: {
          ...opts.ctx,
          authorizedEntities
        }
      })
    }

    throw new TRPCError({ code: 'FORBIDDEN' })
  }

  return fn
}

/**@todo Investigate: `experimental_standaloneMiddleware has been deprecated in favor of .concat()` */
export const requireAssignment = experimental_standaloneMiddleware<{
  input: ActionInputWithType | DeleteActionInput
  ctx: Context
}>().create(async ({ next, ctx, input }) => {
  const event = await getEventById(input.eventId)
  if (
    'transactionId' in input &&
    event.actions.some((action) => action.transactionId === input.transactionId)
  ) {
    return next({
      ctx: { ...ctx, isDuplicateAction: true, event },
      input
    })
  }

  const assignedTo = getAssignedUserFromActions(
    event.actions.filter(
      (action): action is ActionDocument =>
        action.type === ActionType.ASSIGN || action.type === ActionType.UNASSIGN
    )
  )

  if (ctx.user.id !== assignedTo) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: JSON.stringify('You are not assigned to this event')
    })
  }
  return next()
})
