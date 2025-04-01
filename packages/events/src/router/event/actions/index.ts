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
import {
  getEventById,
  addAsyncRejectAction,
  addAction
} from '@events/service/events/events'
import {
  ActionType,
  SCOPES,
  NotifyActionInput,
  getUUID,
  ActionConfirmationResponse,
  ActionStatus,
  RegisterActionInput,
  DeclareActionInput,
  ValidateActionInput,
  RejectDeclarationActionInput,
  ArchiveActionInput,
  PrintCertificateActionInput
} from '@opencrvs/commons'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

const ACTION_PROCEDURE_CONFIG = {
  [ActionType.NOTIFY]: {
    scopes: [SCOPES.RECORD_SUBMIT_INCOMPLETE],
    inputType: NotifyActionInput,
    additionalAcceptFields: undefined,
    validatePayload: false
  },
  [ActionType.DECLARE]: {
    scopes: [
      SCOPES.RECORD_DECLARE,
      SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
      SCOPES.RECORD_REGISTER
    ],
    inputType: DeclareActionInput,
    additionalAcceptFields: undefined,
    validatePayload: true
  },
  [ActionType.VALIDATE]: {
    scopes: [SCOPES.RECORD_SUBMIT_FOR_APPROVAL, SCOPES.RECORD_REGISTER],
    inputType: ValidateActionInput,
    additionalAcceptFields: undefined,
    validatePayload: true
  },
  [ActionType.REGISTER]: {
    scopes: [SCOPES.RECORD_REGISTER],
    inputType: RegisterActionInput,
    additionalAcceptFields: z.object({ registrationNumber: z.string() }),
    validatePayload: true
  },
  [ActionType.REJECT]: {
    scopes: [SCOPES.RECORD_SUBMIT_FOR_UPDATES],
    inputType: RejectDeclarationActionInput,
    additionalAcceptFields: undefined,
    validatePayload: true
  },
  [ActionType.ARCHIVE]: {
    scopes: [SCOPES.RECORD_DECLARATION_ARCHIVE],
    inputType: ArchiveActionInput,
    additionalAcceptFields: undefined,
    validatePayload: true
  },
  [ActionType.PRINT_CERTIFICATE]: {
    scopes: [SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES],
    inputType: PrintCertificateActionInput,
    additionalAcceptFields: undefined,
    validatePayload: true
  }
}

/**
 * Most actions share a similar model, where the action is first requested, and then either synchronously or asynchronously
 * accepted or rejected, via the notify API. The notify APIs are HTTP APIs served by the countryconfig.
 *
 * This function creates a set of extendable router handlers, i.e. procedures, for these kinds of actions.
 *
 * The set includes three routes for any action: 'request', 'accept' and 'reject'.
 * Accept and reject are used only when the action enters the so called asynchronous flow, i.e. when the notify API returns HTTP 202.
 *
 * @param actionType - The action type for which we want to create router handlers.
 */
export function getActionProceduresBase(
  actionType: keyof typeof ACTION_PROCEDURE_CONFIG
) {
  const actionConfig = ACTION_PROCEDURE_CONFIG[actionType]

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

        // If we get an unexpected failure response, we just return HTTP 500 without saving the
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

        // If we immediately get a success response, we can save the registration number and mark the action as accepted
        if (responseStatus === ActionConfirmationResponse.Success) {
          status = ActionStatus.Accepted
        }

        return next({
          ctx: { ...ctx, status, actionId },
          input: { ...input, ...body }
        })
      }),

    accept: publicProcedure
      .use(requireScopesMiddleware)
      .input(actionConfig.inputType.merge(acceptInputFields))
      .use(validatePayloadMiddleware)
      .use(async ({ ctx, input, next }) => {
        const { eventId, actionId } = input
        const event = await getEventById(eventId)
        const action = event.actions.find((a) => a.id === actionId)
        const confirmationAction = event.actions.find(
          (a) => a.originalActionId === actionId
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
      })
      .mutation(({ ctx, input }) => {
        const { token, user, alreadyAccepted } = ctx
        const { eventId, transactionId, actionId } = input

        if (alreadyAccepted) {
          return getEventById(input.eventId)
        }

        // TODO CIHAN: pystyykö originalActionId ja status ymppää inputtii?
        return addAction(input, {
          eventId,
          createdBy: user.id,
          createdAtLocation: user.primaryOfficeId,
          token,
          transactionId,
          status: ActionStatus.Accepted,
          originalActionId: actionId
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
          (a) => a.originalActionId === actionId
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
          input: { ...input, originalActionId: actionId }
        })
      })
      .mutation(async ({ ctx, input }) => {
        const { alreadyRejected } = ctx

        if (alreadyRejected) {
          return getEventById(input.eventId)
        }

        return addAsyncRejectAction({
          ...input,
          type: ActionType.REGISTER
        })
      })
  }
}
