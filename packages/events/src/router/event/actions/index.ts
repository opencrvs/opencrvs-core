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
import { MutationProcedure } from '@trpc/server/unstable-core-do-not-import'
import { z } from 'zod'
import { OpenApiMeta } from 'trpc-to-openapi'
import { getUUID, TokenUserType } from '@opencrvs/commons'
import {
  ActionType,
  ActionStatus,
  EventDocument,
  ActionInput,
  NotifyActionInput,
  RegisterActionInput,
  RejectDeclarationActionInput,
  ArchiveActionInput,
  PrintCertificateActionInput,
  DeclareActionInput,
  ValidateActionInput,
  ACTION_ALLOWED_SCOPES,
  ACTION_ALLOWED_CONFIGURABLE_SCOPES
} from '@opencrvs/commons/events'
import * as middleware from '@events/router/middleware'
import {
  MiddlewareOptions,
  requiresAnyOfScopes
} from '@events/router/middleware'
import { publicProcedure, systemProcedure } from '@events/router/trpc'

import {
  getEventById,
  addAction,
  addAsyncRejectAction
} from '@events/service/events/events'
import {
  ActionConfirmationResponse,
  requestActionConfirmation
} from './actionConfirmationRequest'

/**
 * Configuration for an action procedure
 * @interface ActionProcedureConfig
 * @property {z.ZodType} inputSchema - The Zod schema for validating the action input
 * @property {z.ZodType | undefined} notifyApiPayloadSchema - Schema for notify API response payload if applicable. This will be sent either in the initial HTTP 200 response, or when the action is asynchronously accepted.
 * @property {boolean} validatePayload - Whether the payload should be strictly validated against the inputSchema schema
 * @property {OpenApiMeta} [meta] - Meta information, incl. OpenAPI definition
 */
interface ActionProcedureConfig {
  inputSchema: z.ZodType
  notifyApiPayloadSchema: z.ZodType | undefined
  validatePayload: boolean
  meta?: OpenApiMeta
}

const ACTION_PROCEDURE_CONFIG = {
  [ActionType.NOTIFY]: {
    notifyApiPayloadSchema: undefined,
    validatePayload: false,
    inputSchema: NotifyActionInput,
    meta: {
      openapi: {
        summary: 'Notify an event',
        method: 'POST',
        path: '/events/notifications',
        tags: ['events'],
        protect: true
      }
    }
  },
  [ActionType.DECLARE]: {
    notifyApiPayloadSchema: undefined,
    validatePayload: true,
    inputSchema: DeclareActionInput
  },
  [ActionType.VALIDATE]: {
    notifyApiPayloadSchema: undefined,
    validatePayload: true,
    inputSchema: ValidateActionInput
  },
  [ActionType.REGISTER]: {
    notifyApiPayloadSchema: z.object({ registrationNumber: z.string() }),
    validatePayload: true,
    inputSchema: RegisterActionInput
  },
  [ActionType.REJECT]: {
    notifyApiPayloadSchema: undefined,
    validatePayload: true,
    inputSchema: RejectDeclarationActionInput
  },
  [ActionType.ARCHIVE]: {
    notifyApiPayloadSchema: undefined,
    validatePayload: true,
    inputSchema: ArchiveActionInput
  },
  [ActionType.PRINT_CERTIFICATE]: {
    notifyApiPayloadSchema: undefined,
    validatePayload: true,
    inputSchema: PrintCertificateActionInput
  }
} satisfies Partial<Record<ActionType, ActionProcedureConfig>>

type ActionProcedure = {
  request: MutationProcedure<{
    input: ActionInput
    output: EventDocument
  }>
  accept: MutationProcedure<{
    input: ActionInput & { actionId: string }
    output: EventDocument
  }>
  reject: MutationProcedure<{
    input: { eventId: string; actionId: string; transactionId: string }
    output: EventDocument
  }>
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
export function getDefaultActionProcedures(
  actionType: keyof typeof ACTION_PROCEDURE_CONFIG
): ActionProcedure {
  const actionConfig = ACTION_PROCEDURE_CONFIG[actionType]

  const { notifyApiPayloadSchema, validatePayload, inputSchema } = actionConfig

  let acceptInputFields = z.object({ actionId: z.string() })

  if (notifyApiPayloadSchema) {
    acceptInputFields = acceptInputFields.merge(notifyApiPayloadSchema)
  }

  const requireScopesMiddleware = requiresAnyOfScopes(
    ACTION_ALLOWED_SCOPES[actionType],
    ACTION_ALLOWED_CONFIGURABLE_SCOPES[actionType]
  )

  const validatePayloadMiddleware = validatePayload
    ? middleware.validateAction(actionType)
    : async ({ next }: MiddlewareOptions) => next()

  const meta = 'meta' in actionConfig ? actionConfig.meta : {}

  return {
    request: systemProcedure
      .meta(meta)
      .use(requireScopesMiddleware)
      .input(inputSchema)
      .use(middleware.eventTypeAuthorization)
      .use(middleware.requireAssignment)
      .use(validatePayloadMiddleware)
      .output(EventDocument)
      .mutation(async ({ ctx, input }) => {
        const { token, user, userType, system } = ctx
        const { eventId, transactionId } = input
        const actionId = getUUID()

        if (ctx.isDuplicateAction) {
          return ctx.event
        }

        const event = await getEventById(eventId)

        const { responseStatus, body } = await requestActionConfirmation(
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

        let status: ActionStatus = ActionStatus.Requested
        let parsedBody

        // If we immediately get a rejected response, we can mark the action as rejected
        if (responseStatus === ActionConfirmationResponse.Rejected) {
          status = ActionStatus.Rejected
        }

        // If we immediately get a success response, we mark the action as succeeded
        // and also validate the payload received from the notify API
        if (responseStatus === ActionConfirmationResponse.Success) {
          status = ActionStatus.Accepted

          if (notifyApiPayloadSchema) {
            try {
              parsedBody = notifyApiPayloadSchema.parse(body)
            } catch {
              throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Invalid payload received from notification API'
              })
            }
          }
        }

        const { createdBy, createdByRole, createdAtLocation } =
          userType === TokenUserType.USER
            ? {
                createdBy: user.id,
                createdByRole: user.role,
                createdAtLocation: user.primaryOfficeId
              }
            : {
                createdBy: system.id,
                createdByRole: 'TODO',
                createdAtLocation: 'TODO'
              }

        return addAction(
          { ...input, ...parsedBody },
          {
            eventId,
            createdBy,
            createdByRole,
            createdAtLocation,
            token,
            transactionId,
            status
          },
          actionId
        )
      }),

    accept: systemProcedure
      .use(requireScopesMiddleware)
      .input(inputSchema.merge(acceptInputFields))
      .use(validatePayloadMiddleware)
      .mutation(async ({ ctx, input }) => {
        const { token, user } = ctx
        const { eventId, actionId, transactionId } = input
        const event = await getEventById(eventId)
        const originalAction = event.actions.find((a) => a.id === actionId)
        const confirmationAction = event.actions.find(
          (a) => a.originalActionId === actionId
        )

        // Original action is not found
        if (!originalAction) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Action not found.'
          })
        }

        if (confirmationAction) {
          // Action is already rejected, so we throw an error
          if (confirmationAction.status === ActionStatus.Rejected) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Action has already been rejected.'
            })
          }

          // Action is already confirmed, so we just return the event
          return getEventById(input.eventId)
        }

        return addAction(
          { ...input, originalActionId: actionId },
          {
            eventId,
            createdBy: user.id,
            createdByRole: user.role,
            createdAtLocation: user.primaryOfficeId,
            token,
            transactionId,
            status: ActionStatus.Accepted
          }
        )
      }),

    // TODO CIHAN
    reject: publicProcedure
      .use(requireScopesMiddleware)
      .input(
        z.object({
          actionId: z.string(),
          eventId: z.string(),
          transactionId: z.string()
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { eventId, actionId } = input
        const event = await getEventById(eventId)
        const action = event.actions.find((a) => a.id === actionId)
        const confirmationAction = event.actions.find(
          (a) => a.originalActionId === actionId
        )

        // Action is not found
        if (!action) {
          throw new Error(`Action not found.`)
        }

        if (confirmationAction) {
          // Action is already accepted
          if (confirmationAction.status === ActionStatus.Accepted) {
            throw new Error(`Action has already been accepted.`)
          }

          // Action is already rejected, so we just return the event
          return getEventById(input.eventId)
        }

        return addAsyncRejectAction({
          ...input,
          originalActionId: actionId,
          type: actionType,
          createdBy: ctx.user.id,
          createdByRole: ctx.user.role,
          createdAtLocation: ctx.user.primaryOfficeId
        })
      })
  }
}
