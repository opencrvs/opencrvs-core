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
import * as z from 'zod/v4'
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
  ACTION_SCOPE_MAP,
  RequestCorrectionActionInput,
  ApproveCorrectionActionInput,
  RejectCorrectionActionInput,
  getPendingAction,
  ActionInputWithType,
  EventConfig,
  BaseActionInput,
  CustomActionInput,
  EditActionInput
} from '@opencrvs/commons/events'
import { EventActionAuditLog } from '@opencrvs/commons/events'
import { TokenWithBearer } from '@opencrvs/commons/authentication'
import * as middleware from '@events/router/middleware'
import { setBearerForToken } from '@events/router/middleware'
import { userAndSystemProcedure, userOnlyProcedure } from '@events/router/trpc'

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
import { writeAuditLog } from '@events/storage/postgres/events/auditLog'
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
  inputSchema: z.ZodObject<z.ZodRawShape>
  actionConfirmationResponseSchema: z.ZodObject<z.ZodRawShape> | undefined
  meta?: OpenApiMeta
}

const defaultConfig = {
  actionConfirmationResponseSchema: undefined
} as const

const ACTION_PROCEDURE_CONFIG = {
  [ActionType.EDIT]: {
    ...defaultConfig,
    inputSchema: EditActionInput
  },
  [ActionType.CUSTOM]: {
    ...defaultConfig,
    inputSchema: CustomActionInput
  },
  [ActionType.NOTIFY]: {
    ...defaultConfig,
    inputSchema: NotifyActionInput,
    meta: {
      openapi: {
        summary: 'Notify an event',
        method: 'POST',
        path: '/events/{eventId}/notify',
        tags: ['events'],
        protect: true
      }
    }
  },
  [ActionType.DECLARE]: {
    ...defaultConfig,
    inputSchema: DeclareActionInput
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
        path: '/events/{eventId}/correction/request',
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
        path: '/events/{eventId}/correction/approve',
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
        path: '/events/{eventId}/correction/reject',
        tags: ['events'],
        protect: true
      }
    }
  }
} satisfies Partial<Record<ActionType, ActionProcedureConfig>>

/**
 * Maps action types to their corresponding audit log operation names (tRPC paths).
 * Only includes action types that should be audit-logged.
 */
const AUDIT_LOG_OPERATION_MAP: Partial<
  Record<keyof typeof ACTION_PROCEDURE_CONFIG, EventActionAuditLog['operation']>
> = {
  [ActionType.NOTIFY]: 'event.actions.notify.request',
  [ActionType.DECLARE]: 'event.actions.declare.request',
  [ActionType.REGISTER]: 'event.actions.register.request',
  [ActionType.REJECT]: 'event.actions.reject.request',
  [ActionType.ARCHIVE]: 'event.actions.archive.request',
  [ActionType.PRINT_CERTIFICATE]: 'event.actions.print_certificate.request',
  [ActionType.EDIT]: 'event.actions.edit.request',
  [ActionType.REQUEST_CORRECTION]: 'event.actions.correction.request.request',
  [ActionType.APPROVE_CORRECTION]: 'event.actions.correction.approve.request',
  [ActionType.REJECT_CORRECTION]: 'event.actions.correction.reject.request'
}

type DistributiveOmit<T, K extends keyof T> = T extends T ? Omit<T, K> : never

const AsyncActionInput = BaseActionInput.pick({
  eventId: true,
  transactionId: true,
  keepAssignment: true
}).extend({
  actionId: UUID
})

export type AsyncActionInput = z.infer<typeof AsyncActionInput>

const SyncActionConfirmationSchema = BaseActionInput.pick({
  declaration: true,
  annotation: true
})

type ActionProcedure = {
  request: MutationProcedure<{
    input: ActionInput
    output: EventDocument
    meta: OpenApiMeta
  }>
  accept: MutationProcedure<{
    input: DistributiveOmit<
      ActionInput,
      'keepAssignmentIfAccepted' | 'keepAssignmentIfRejected'
    > & { actionId: string }
    output: EventDocument
    meta: OpenApiMeta
  }>
  reject: MutationProcedure<{
    input: z.input<typeof AsyncActionInput>
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
  actionConfirmationResponseSchema?: z.ZodObject<z.ZodRawShape>
) {
  await throwConflictIfActionNotAllowed(
    input.eventId,
    input.type,
    token,
    'customActionType' in input ? input.customActionType : undefined
  )

  const eventWithRequestedAction = await addAction(input, {
    eventId: event.id,
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

  const { responseStatus, responseBody } = await requestActionConfirmation(
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
  }

  // For Async flow, we just return the event with the requested action and ensure it is indexed
  if (responseStatus === ActionConfirmationResponse.RequiresProcessing) {
    await ensureEventIndexed(eventWithRequestedAction, configuration)
    return eventWithRequestedAction
  }

  // For Sync flow, we parse the result and merge it with the action input
  // before storing the accepted/rejected action
  const status =
    responseStatus === ActionConfirmationResponse.Success
      ? ActionStatus.Accepted
      : ActionStatus.Rejected

  const schema =
    responseStatus === ActionConfirmationResponse.Success
      ? SyncActionConfirmationSchema.extend(
          (actionConfirmationResponseSchema ?? z.object({})).shape
        )
      : z.object({})

  const maybeParsed = schema.safeParse(responseBody ?? {})

  if (!maybeParsed.success) {
    logger.error(maybeParsed.error)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message:
        'Invalid payload received from country config action confirmation API'
    })
  }

  const parsedBody = maybeParsed.data

  logger.debug(
    {
      transactionId: input.transactionId,
      eventType: event.type,
      actionType: input.type,
      eventId: event.id
    },
    `Action immediately ${status === ActionStatus.Accepted ? 'accepted' : 'rejected'} (status: "${responseStatus}")`
  )

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    declaration,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    annotation,
    keepAssignment,
    keepAssignmentIfAccepted,
    keepAssignmentIfRejected,
    ...strippedInput
  } = input

  const effectiveKeepAssignment =
    status === ActionStatus.Accepted
      ? (keepAssignmentIfAccepted ?? keepAssignment ?? false)
      : (keepAssignmentIfRejected ?? keepAssignment ?? false)

  return processAction(
    {
      ...strippedInput,
      keepAssignment: effectiveKeepAssignment,
      declaration: {},
      originalActionId: requestedAction.id,
      ...parsedBody
    },
    { eventId: event.id, user, token, status, configuration }
  )
}

/**
 * To prevent accidental access granting, we want to make sure that system users can only access events with scopes that explicitly allow system user access, even if the scope options would match the system user's context.
 */
const SYSTEM_USER_ALLOWED_ACTIONS = [
  ActionType.NOTIFY,
  ActionType.REJECT_CORRECTION,
  ActionType.APPROVE_CORRECTION,
  ActionType.REQUEST_CORRECTION
] as const

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

  const meta = 'meta' in actionConfig ? actionConfig.meta : {}

  const userTypeBasedProcedure = SYSTEM_USER_ALLOWED_ACTIONS.some(
    (act) => act === actionType
  )
    ? userAndSystemProcedure
    : userOnlyProcedure

  return {
    request: userTypeBasedProcedure
      .meta(meta)
      .use(middleware.canAccessEventWithScopes(ACTION_SCOPE_MAP[actionType]))
      .input(actionConfig.inputSchema.strict())
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

        const result = await defaultRequestHandler(
          input,
          user,
          token,
          event,
          eventConfiguration,
          actionConfig.actionConfirmationResponseSchema
        )

        const auditOperation = AUDIT_LOG_OPERATION_MAP[actionType]
        if (auditOperation) {
          await writeAuditLog({
            clientId: user.id,
            clientType: user.type,
            operation: auditOperation,
            requestData: {
              eventId,
              actionType,
              eventType: result.type,
              trackingId: result.trackingId,
              transactionId: input.transactionId
            }
          })
        }

        return result
      }),

    accept: userAndSystemProcedure
      .input(
        actionConfig.inputSchema
          .extend(AsyncActionInput.shape)
          .extend(
            (actionConfig.actionConfirmationResponseSchema ?? z.object({}))
              .shape
          )
      )
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
          {
            ...input,
            originalActionId: actionId
          },
          {
            eventId: event.id,
            user,
            token,
            status: ActionStatus.Accepted,
            configuration
          }
        )
      }),

    reject: userAndSystemProcedure
      .input(AsyncActionInput)
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

        const configuration = await getEventConfigurationById({
          token: ctx.token,
          eventType: event.type
        })

        return addAsyncRejectAction(
          {
            ...input,
            type: actionType,
            originalActionId: actionId,
            keepAssignment: input.keepAssignment ?? false
          },
          {
            event,
            user: ctx.user,
            configuration
          }
        )
      })
  }
}
