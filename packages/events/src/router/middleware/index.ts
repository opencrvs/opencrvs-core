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
  TRPCError
} from '@trpc/server/unstable-core-do-not-import'
import { OpenApiMeta } from 'trpc-to-openapi'
import {
  ActionInputWithType,
  CustomFlags,
  getCurrentEventState
} from '@opencrvs/commons'
import { TrpcContext } from '@events/context'
import { getEventById } from '@events/service/events/events'
import { getEventConfigurationById } from '@events/service/config/config'

/**
 * Middleware function that checks if the event is in waiting for correction approval/rejection.
 * Certain actions are only allowed if the event is not waiting for correction.
 *
 * @param input - Object containing eventId
 * @param next - Next middleware function to be called
 * @param ctx - TrpcContext object containing token and user
 * @returns Next middleware result
 * @throws {TRPCError} With code 'CONFLICT' if event is waiting for correction
 */
export const conflictIfWaitingForCorrection: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext,
  ActionInputWithType
> = async ({ input, next, ctx }) => {
  const event = await getEventById(input.eventId)

  const eventConfig = await getEventConfigurationById({
    token: ctx.token,
    eventType: event.type
  })

  const eventState = getCurrentEventState(event, eventConfig)

  console.log('CIHAN TEST')
  console.log(eventState)

  if (eventState.flags.includes(CustomFlags.CORRECTION_REQUESTED)) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: JSON.stringify('Event is waiting for correction')
    })
  }

  return next()
}

export const checkForDuplicateAction: MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext,
  ActionInputWithType
> = async ({ input, next, ctx }) => {
  const event = await getEventById(input.eventId)

  // First check if the action is a duplicate
  if (
    'transactionId' in input &&
    event.actions.some((action) => action.transactionId === input.transactionId)
  ) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: JSON.stringify('Action is a duplicate')
    })
  }

  return next()
}

export * from './authorization'
export * from './validate'
export * from './utils'
