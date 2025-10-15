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
import { logger, UUID } from '@opencrvs/commons'
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
  ACTION_SCOPE_MAP,
  RequestCorrectionActionInput,
  ApproveCorrectionActionInput,
  RejectCorrectionActionInput,
  getPendingAction,
  ActionInputWithType,
  EventConfig
} from '@opencrvs/commons/events'
import {
  TokenUserType,
  TokenWithBearer
} from '@opencrvs/commons/authentication'
import * as middleware from '@events/router/middleware'
import {
  requiresAnyOfScopes,
  setBearerForToken
} from '@events/router/middleware'
import { systemProcedure } from '@events/router/trpc'

import {
  getEventById,
  addAction,
  addAsyncRejectAction,
  throwConflictIfActionNotAllowed,
  ensureEventIndexed,
  processAction
} from '@events/service/events/events'
import { getEventConfigurationById } from '@events/service/config/config'
import { TrpcUserContext } from '@events/context'
import { getActionConfirmationToken } from '@events/service/auth'
import {
  ActionConfirmationResponse,
  requestActionConfirmation
} from './actionConfirmationRequest'

/**
 * Configuration for an action procedure
 * @interface ActionProcedureConfig
 * @property {z.ZodType} inputSchema - The Zod schema for validating the action input
 * @property {z.ZodType | undefined} notifyApiPayloadSchema - Schema for notify API response payload if applicable. This will be sent either in the initial HTTP 200 response, or when the action is asynchronously accepted.
 * @property {OpenApiMeta} [meta] - Meta information, incl. OpenAPI definition
 */
interface ActionProcedureConfig {
  inputSchema: z.ZodType
  actionConfirmationResponseSchema: z.ZodType | undefined
  meta?: OpenApiMeta
}

const defaultConfig = {
  actionConfirmationResponseSchema: undefined
} as const

const ACTION_PROCEDURE_CONFIG = {
  [ActionType.NOTIFY]: {
    ...defaultConfig,
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
    ...defaultConfig,
    inputSchema: DeclareActionInput
  },
  [ActionType.VALIDATE]: {
    ...defaultConfig,
    inputSchema: ValidateActionInput
  },
  [ActionType.REGISTER]: {
    ...defaultConfig,
    actionConfirmationResponseSchema: z.object({
      registrationNumber: z.string()
    }),
    inputSchema: RegisterActionInput
  },
  [ActionType.REJECT]: {
    ...defaultConfig,
    inputSchema: RejectDeclarationActionInput
  },
  [ActionType.ARCHIVE]: {
    ...defaultConfig,
    inputSchema: ArchiveActionInput
  },
  [ActionType.PRINT_CERTIFICATE]: {
    ...defaultConfig,
    inputSchema: PrintCertificateActionInput
  },
  [ActionType.REQUEST_CORRECTION]: {
    ...defaultConfig,
    inputSchema: RequestCorrectionActionInput,
    meta: {
      openapi: {
        summary: 'Request correction for an event',
        method: 'POST',
        path: '/events/correction/request',
        tags: ['events'],
        protect: true
      }
    }
  },
  [ActionType.APPROVE_CORRECTION]: {
    ...defaultConfig,
    inputSchema: ApproveCorrectionActionInput,
    meta: {
      openapi: {
        summary: 'Approve correction for an event',
        method: 'POST',
        path: '/events/correction/approve',
        tags: ['events'],
        protect: true
      }
    }
  },
  [ActionType.REJECT_CORRECTION]: {
    ...defaultConfig,
    inputSchema: RejectCorrectionActionInput,
    meta: {
      openapi: {
        summary: 'Reject correction for an event',
        method: 'POST',
        path: '/events/correction/reject',
        tags: ['events'],
        protect: true
      }
    }
  }
} satisfies Partial<Record<ActionType, ActionProcedureConfig>>

type ActionProcedure = {
  request: MutationProcedure<{
    input: ActionInput
    output: EventDocument
    meta: OpenApiMeta
  }>
  accept: MutationProcedure<{
    input: ActionInput & { actionId: string }
    output: EventDocument
    meta: OpenApiMeta
  }>
  reject: MutationProcedure<{
    input: { eventId: string; actionId: string; transactionId: string }
    output: EventDocument
    meta: OpenApiMeta
  }>
}

export async function defaultRequestHandler(
  input: ActionInputWithType,
  user: TrpcUserContext,
  token: TokenWithBearer,
  event: EventDocument,
  configuration: EventConfig,
  // @TODO: Could this be typed with the actual input schema, or could these actually be anything?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputSchema: z.ZodObject<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actionConfirmationResponseSchema?: z.ZodObject<any>
) {
  await throwConflictIfActionNotAllowed(input.eventId, input.type, token)

  const eventWithRequestedAction = await addAction(input, {
    event,
    user,
    token,
    status: ActionStatus.Requested,
    configuration
  })

  const requestedAction = getPendingAction(eventWithRequestedAction.actions)
  const eventActionToken = await getActionConfirmationToken(
    { eventId: input.eventId, actionId: requestedAction.id },
    token
  )
  const { responseStatus, responseBody: confirmationResponse } =
    await requestActionConfirmation(
      input.type,
      input.transactionId,
      eventWithRequestedAction,
      setBearerForToken(eventActionToken)
    )

  // If we get an unexpected failure response, we just return HTTP 500 without saving the
  if (responseStatus === ActionConfirmationResponse.UnexpectedFailure) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected failure from country config action confirmation API'
    })
    // For Async flow, we just return the event with the requested action and ensure it is indexed
  } else if (responseStatus === ActionConfirmationResponse.RequiresProcessing) {
    await ensureEventIndexed(eventWithRequestedAction, configuration)
    return eventWithRequestedAction
  }

  let status: ActionStatus = ActionStatus.Requested
  let parsedBody

  // If we immediately get a rejected response, we can mark the action as rejected
  if (responseStatus === ActionConfirmationResponse.Rejected) {
    status = ActionStatus.Rejected

    logger.debug(
      {
        transactionId: input.transactionId,
        actionType: input.type,
        eventId: event.id
      },
      `Action immediately rejected (status: "${responseStatus}")`
    )
  }

  // If we immediately get a success response, we mark the action as succeeded
  // and also validate the payload received from the notify API
  if (responseStatus === ActionConfirmationResponse.Success) {
    status = ActionStatus.Accepted

    try {
      parsedBody = (actionConfirmationResponseSchema ?? z.object({}))
        .merge(inputSchema.partial())
        .parse(confirmationResponse ?? {})
    } catch (error) {
      logger.error(error)

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'Invalid payload received from country config action confirmation API'
      })
    }

    logger.debug(
      {
        transactionId: input.transactionId,
        eventType: event.type,
        actionType: input.type,
        eventId: event.id
      },
      `Action immediately accepted (status: "${responseStatus}")`
    )
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { declaration, annotation, ...strippedInput } = input

  const updatedEvent = await processAction(
    {
      ...strippedInput,
      declaration: {},
      originalActionId: requestedAction.id,
      ...parsedBody
    },
    { event, user, token, status, configuration }
  )

  return updatedEvent
}

/**
 * These fields aren't required in the synchronous flow as the action is processed immediately and we still have access to them.
 */
const AsyncActionConfirmationResponseSchema = z.object({
  eventId: UUID,
  actionId: UUID,
  transactionId: z.string()
})

export type AsyncActionConfirmationResponseSchema = z.infer<
  typeof AsyncActionConfirmationResponseSchema
>

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

  let asyncAcceptInputFields = AsyncActionConfirmationResponseSchema

  if (actionConfig.actionConfirmationResponseSchema) {
    asyncAcceptInputFields = asyncAcceptInputFields.merge(
      actionConfig.actionConfirmationResponseSchema
    )
  }

  const requireScopesForRequestMiddleware = requiresAnyOfScopes(
    [],
    ACTION_SCOPE_MAP[actionType]
  )

  const meta = 'meta' in actionConfig ? actionConfig.meta : {}

  return {
    request: systemProcedure
      .meta(meta)
      .use(requireScopesForRequestMiddleware)
      .input(actionConfig.inputSchema)
      .use(middleware.eventTypeAuthorization)
      .use(middleware.requireAssignment)
      .use(middleware.validateAction)
      .use(middleware.detectDuplicate)
      .use(middleware.requireLocationForSystemUserAction)
      .output(EventDocument)
      .mutation(async ({ ctx, input }) => {
        const { token, user, existingAction, duplicates } = ctx
        const { eventId } = input
        const event = await getEventById(eventId)
        const eventConfiguration = await getEventConfigurationById({
          token,
          eventType: event.type
        })

        if (existingAction) {
          return ctx.event
        }

        if (duplicates.detected) {
          return duplicates.event
        }

        return defaultRequestHandler(
          input,
          user,
          token,
          event,
          eventConfiguration,
          actionConfig.inputSchema,
          actionConfig.actionConfirmationResponseSchema
        )
      }),

    accept: systemProcedure
      .input(actionConfig.inputSchema.merge(asyncAcceptInputFields))
      .use(middleware.requireActionConfirmationAuthorization)
      .mutation(async ({ ctx, input }) => {
        const { token, user } = ctx
        const { eventId, actionId } = input
        const event = await getEventById(eventId)
        const originalAction = event.actions.find((a) => a.id === actionId)
        const confirmationAction = event.actions.find(
          (a) => a.originalActionId === actionId
        )
        const configuration = await getEventConfigurationById({
          token,
          eventType: event.type
        })

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
            logger.debug(
              {
                eventType: event.type,
                actionType,
                eventId: event.id,
                transactionId: input.transactionId
              },
              `Action already rejected`
            )

            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Action has already been rejected.'
            })
          }

          logger.debug(
            {
              eventType: event.type,
              actionType,
              eventId: event.id,
              transactionId: input.transactionId
            },
            `Accepting`
          )

          // Action is already confirmed, so we just return the event
          return getEventById(input.eventId)
        }

        return processAction(
          { ...input, originalActionId: actionId },
          {
            event,
            user,
            token,
            status: ActionStatus.Accepted,
            configuration
          }
        )
      }),

    reject: systemProcedure
      .input(AsyncActionConfirmationResponseSchema)
      .use(middleware.requireActionConfirmationAuthorization)
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
          createdByUserType: TokenUserType.Enum.user,
          createdByRole: ctx.user.role,
          createdAtLocation: ctx.user.primaryOfficeId ?? undefined,
          token: ctx.token,
          eventType: event.type
        })
      })
  }
}
