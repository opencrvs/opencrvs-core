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
import * as middleware from '@events/router/middleware'
import {
  MiddlewareOptions,
  requiresAnyOfScopes
} from '@events/router/middleware'
import { publicProcedure } from '@events/router/trpc'
import { notifyOnAction } from '@events/service/config/config'
import { getEventById, addRejectAction } from '@events/service/events/events'
import {
  ActionType,
  SCOPES,
  RegisterActionInput,
  NotifyActionInput,
  getUUID,
  ActionConfirmationResponse,
  ActionStatus
} from '@opencrvs/commons'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

const ACTIONS = {
  [ActionType.REGISTER]: {
    scopes: [SCOPES.RECORD_REGISTER],
    inputType: RegisterActionInput,
    additionalAcceptFields: z.object({ registrationNumber: z.string() }),
    validatePayload: true
  },
  [ActionType.NOTIFY]: {
    scopes: [SCOPES.RECORD_SUBMIT_INCOMPLETE],
    inputType: NotifyActionInput,
    additionalAcceptFields: undefined,
    validatePayload: false
  }
}

/* TODO CIHAN: add comment here */
export function getActionProceduresBase(actionType: keyof typeof ACTIONS) {
  const actionConfig = ACTIONS[actionType]

  if (!actionConfig) {
    throw new Error(`Action not configured: ${actionType}`)
  }

  let acceptInputFields = z.object({ actionId: z.string() })

  if (actionConfig.additionalAcceptFields) {
    acceptInputFields = acceptInputFields.merge(
      actionConfig.additionalAcceptFields
    )
  }

  const requireScopesMiddleware = requiresAnyOfScopes(actionConfig.scopes)
  const validatePayloadMiddleware = actionConfig.validatePayload
    ? middleware.validateAction(actionType)
    : async ({ next }: MiddlewareOptions) => next()

  return {
    request: publicProcedure
      .use(requireScopesMiddleware)
      .input(actionConfig.inputType)
      .use(validatePayloadMiddleware)
      .use(async ({ ctx, input, next }) => {
        const { token } = ctx
        const { eventId } = input
        const actionId = getUUID()
        const event = await getEventById(eventId)

        const { responseStatus, body } = await notifyOnAction(
          input,
          event,
          token,
          actionId
        )

        // If we get an unexpected failure response, we don't want to save the action
        if (responseStatus === ActionConfirmationResponse.UnexpectedFailure) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Unexpected failure from notification API'
          })
        }

        let status = ActionStatus.Requested

        // If we immediately get a rejected response, we can mark the action as rejected
        if (responseStatus === ActionConfirmationResponse.Rejected) {
          status = ActionStatus.Rejected
        }

        let additionalFields = {}

        // TODO CIHAN: siirrä tää tonne registerin handleriin?
        // If we immediately get a success response, we can save the registration number and mark the action as accepted
        if (responseStatus === ActionConfirmationResponse.Success) {
          if (actionType === ActionType.REGISTER) {
            const registrationNumber = body?.registrationNumber
            if (!registrationNumber || typeof registrationNumber !== 'string') {
              throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message:
                  'Invalid registration number received from notification API'
              })
            }
            additionalFields = { registrationNumber }
          }

          status = ActionStatus.Accepted
        }

        return next({
          ctx: { ...ctx, status, actionId },
          input: { ...input, ...additionalFields }
        })
      }),

    accept: publicProcedure
      .use(requireScopesMiddleware)
      .input(actionConfig.inputType.merge(acceptInputFields))
      .use(middleware.validateAction(actionType))
      .use(async ({ ctx, input, next }) => {
        const { eventId, actionId } = input
        const event = await getEventById(eventId)
        const action = event.actions.find((a) => a.id === actionId)
        const confirmationAction = event.actions.find(
          (a) => a.confirmationForActionWithId === actionId
        )

        if (!action) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Action not found.'
          })
        }

        if (
          confirmationAction &&
          confirmationAction.status === ActionStatus.Rejected
        ) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Action has already been rejected.'
          })
        }

        return next({
          ctx: { ...ctx, alreadyAccepted: Boolean(confirmationAction) },
          input
        })
      }),

    reject: publicProcedure
      .use(requireScopesMiddleware)
      .input(
        z.object({
          actionId: z.string(),
          eventId: z.string(),
          transactionId: z.string()
        })
      )
      .use(async ({ ctx, input, next }) => {
        const { eventId, actionId } = input
        const event = await getEventById(eventId)
        const action = event.actions.find((a) => a.id === actionId)
        const confirmationAction = event.actions.find(
          (a) => a.confirmationForActionWithId === actionId
        )

        if (!action) {
          throw new Error(`Action not found.`)
        }

        if (
          confirmationAction &&
          confirmationAction.status === ActionStatus.Accepted
        ) {
          throw new Error(`Action has already been accepted.`)
        }

        return next({
          ctx: { ...ctx, alreadyRejected: Boolean(confirmationAction) },
          input
        })
      })
      .mutation(async ({ ctx, input }) => {
        const { alreadyRejected } = ctx

        if (alreadyRejected) {
          return getEventById(input.eventId)
        }

        return addRejectAction({
          ...input,
          type: ActionType.REGISTER
        })
      })
  }
}
