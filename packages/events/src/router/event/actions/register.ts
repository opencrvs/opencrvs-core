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
import { requiresAnyOfScopes } from '@events/router/middleware'
import { router, publicProcedure } from '@events/router/trpc'
import { notifyOnAction } from '@events/service/config/config'
import {
  addAction,
  addRejectAction,
  getEventById
} from '@events/service/events/events'
import {
  SCOPES,
  RegisterActionInput,
  ActionType,
  ActionStatus,
  ActionConfirmationResponse,
  getUUID,
  NotifyActionInput
} from '@opencrvs/commons'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

const ACTIONS = {
  [ActionType.REGISTER]: {
    scopes: [SCOPES.RECORD_REGISTER],
    inputType: RegisterActionInput,
    additionalAcceptFields: z.object({ registrationNumber: z.string() })
  },
  [ActionType.NOTIFY]: {
    scopes: [SCOPES.RECORD_SUBMIT_INCOMPLETE],
    inputType: NotifyActionInput,
    additionalAcceptFields: undefined
  }
}

function getActionProceduresBase(actionType: keyof typeof ACTIONS) {
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

  return {
    request: publicProcedure
      .use(requireScopesMiddleware)
      .input(actionConfig.inputType)
      .use(middleware.validateAction(actionType))
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

        // If we immediately get a success response, we can save the registration number and mark the action as accepted
        if (responseStatus === ActionConfirmationResponse.Success) {
          if (actionType === ActionType.REGISTER) {
            // TODO CIHAN: siirrä tää tonne registerin handleriin?
            const registrationNumber = body?.registrationNumber
            if (!registrationNumber || typeof registrationNumber !== 'string') {
              throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Invalid registration number!'
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
      .use(middleware.validateAction(actionType)),

    reject: publicProcedure.use(requireScopesMiddleware).input(
      z.object({
        actionId: z.string(),
        eventId: z.string(),
        transactionId: z.string()
      })
    )
  }
}

const registerActionProcedureBase = getActionProceduresBase(ActionType.REGISTER)

export const registerRoutes2 = {
  request: registerActionProcedureBase.request.mutation(({ ctx, input }) => {
    const { token, user, status, actionId } = ctx
    const { eventId, transactionId } = input

    return addAction(
      input,
      {
        eventId,
        createdBy: user.id,
        createdAtLocation: user.primaryOfficeId,
        token,
        transactionId,
        status
      },
      actionId
    )
  })
  // accept: registerActionProcedureBase.accept,
  // reject: registerActionProcedureBase.reject
}

const registerRoutes = {
  // request: publicProcedure
  //   .use(requiresAnyOfScopes([SCOPES.RECORD_REGISTER]))
  //   // @TODO: Find out a way to dynamically modify the MiddlewareOptions type
  //   .input(RegisterActionInput)
  //   .use(middleware.validateAction(ActionType.REGISTER))
  //   .mutation(async ({ ctx, input }) => {
  //     const { token, user } = ctx
  //     const { eventId, transactionId } = input
  //     const actionId = getUUID()

  //     const { responseStatus, body } = await notifyOnAction(
  //       input,
  //       await getEventById(eventId),
  //       token,
  //       actionId
  //     )

  //     let status = ActionStatus.Requested
  //     let actionInput = input

  //     // If we get an unexpected failure response, we don't want to save the action
  //     if (responseStatus === ActionConfirmationResponse.UnexpectedFailure) {
  //       throw new TRPCError({
  //         code: 'INTERNAL_SERVER_ERROR',
  //         message: 'Unexpected failure from notification API'
  //       })
  //     }

  //     // If we immediately get a rejected response, we can mark the action as rejected
  //     if (responseStatus === ActionConfirmationResponse.Rejected) {
  //       status = ActionStatus.Rejected
  //     }

  //     // If we immediately get a success response, we can save the registration number and mark the action as accepted
  //     if (responseStatus === ActionConfirmationResponse.Success) {
  //       const registrationNumber = body?.registrationNumber

  //       if (!registrationNumber || typeof registrationNumber !== 'string') {
  //         throw new TRPCError({
  //           code: 'INTERNAL_SERVER_ERROR',
  //           message: 'Invalid registration number!'
  //         })
  //       }

  //       actionInput = { ...actionInput, registrationNumber }
  //       status = ActionStatus.Accepted
  //     }

  //     return addAction(
  //       actionInput,
  //       {
  //         eventId,
  //         createdBy: user.id,
  //         createdAtLocation: user.primaryOfficeId,
  //         token,
  //         transactionId,
  //         status
  //       },
  //       actionId
  //     )
  //   }),

  accept: publicProcedure
    .use(requiresAnyOfScopes([SCOPES.RECORD_REGISTER]))
    // TODO CIHAN: yleistä tää tyyppi
    .input(
      RegisterActionInput.merge(
        z.object({ actionId: z.string(), registrationNumber: z.string() })
      )
    )
    .use(middleware.validateAction(ActionType.REGISTER))
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
        confirmationAction.status === ActionStatus.Rejected
      ) {
        throw new Error(`Action has already been rejected.`)
      }

      return next({
        ctx: { ...ctx, alreadyAccepted: Boolean(confirmationAction) },
        input
      })
    })
    .mutation(({ ctx, input }) => {
      const { token, user, alreadyAccepted } = ctx
      const { eventId, transactionId, actionId } = input

      if (alreadyAccepted) {
        return getEventById(input.eventId)
      }

      return addAction(input, {
        eventId,
        createdBy: user.id,
        createdAtLocation: user.primaryOfficeId,
        token,
        transactionId,
        status: ActionStatus.Accepted,
        confirmationForActionWithId: actionId
      })
    }),

  reject: publicProcedure
    .use(requiresAnyOfScopes([SCOPES.RECORD_REGISTER]))
    // TODO CIHAN: fiksaa ja yleistä tyyppi
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

export const registerRouter = router({ ...registerRoutes, ...registerRoutes2 })
