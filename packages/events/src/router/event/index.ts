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
import { z } from 'zod'
import { getUUID } from '@opencrvs/commons'
import {
  ActionType,
  Draft,
  DraftInput,
  EventIndex,
  EventInput,
  EventSearchIndex,
  ActionStatus,
  ApproveCorrectionActionInput,
  EventConfig,
  RejectCorrectionActionInput,
  RequestCorrectionActionInput,
  AssignActionInput,
  UnassignActionInput,
  ACTION_ALLOWED_SCOPES,
  CONFIG_GET_ALLOWED_SCOPES,
  DeleteActionInput
} from '@opencrvs/commons/events'
import * as middleware from '@events/router/middleware'
import { requiresAnyOfScopes } from '@events/router/middleware/authorization'
import { publicProcedure, router } from '@events/router/trpc'
import { getEventConfigurations } from '@events/service/config/config'
import { approveCorrection } from '@events/service/events/actions/approve-correction'
import { rejectCorrection } from '@events/service/events/actions/reject-correction'
import { createDraft, getDraftsByUserId } from '@events/service/events/drafts'
import {
  addAction,
  createEvent,
  deleteEvent,
  getEventById
} from '@events/service/events/events'
import { getIndex, getIndexedEvents } from '@events/service/indexing/indexing'
import { assignRecord } from '@events/service/events/actions/assign'
import { unassignRecord } from '@events/service/events/actions/unassign'
import { getDefaultActionProcedures } from './actions'

function validateEventType({
  eventTypes,
  eventInputType
}: {
  eventTypes: string[]
  eventInputType: string
}) {
  if (!eventTypes.includes(eventInputType)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Invalid event type ${eventInputType}. Valid event types are: ${eventTypes.join(
        ', '
      )}`
    })
  }
}

export const eventRouter = router({
  config: router({
    get: publicProcedure
      .use(requiresAnyOfScopes(CONFIG_GET_ALLOWED_SCOPES))
      .output(z.array(EventConfig))
      .query(async (options) => {
        return getEventConfigurations(options.ctx.token)
      })
  }),
  create: publicProcedure
    .use(requiresAnyOfScopes(ACTION_ALLOWED_SCOPES[ActionType.CREATE]))
    .input(EventInput)
    .mutation(async (options) => {
      const config = await getEventConfigurations(options.ctx.token)
      const eventIds = config.map((c) => c.id)

      validateEventType({
        eventTypes: eventIds,
        eventInputType: options.input.type
      })

      return createEvent({
        eventInput: options.input,
        createdBy: options.ctx.user.id,
        createdAtLocation: options.ctx.user.primaryOfficeId,
        transactionId: options.input.transactionId
      })
    }),
  /**@todo We need another endpoint to get eventIndex by eventId for fetching a “public subset” of a record */
  get: publicProcedure
    .use(requiresAnyOfScopes(ACTION_ALLOWED_SCOPES[ActionType.READ]))
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const event = await getEventById(input)
      const updatedEvent = await addAction(
        {
          type: ActionType.READ,
          eventId: event.id,
          transactionId: getUUID(),
          declaration: {}
        },
        {
          eventId: event.id,
          createdBy: ctx.user.id,
          createdAtLocation: ctx.user.primaryOfficeId,
          token: ctx.token,
          transactionId: getUUID(),
          status: ActionStatus.Accepted
        }
      )

      return updatedEvent
    }),
  delete: publicProcedure
    .use(requiresAnyOfScopes(ACTION_ALLOWED_SCOPES[ActionType.DELETE]))
    .input(DeleteActionInput)
    .use(middleware.requireAssignment)
    .mutation(async ({ input, ctx }) => {
      return deleteEvent(input.eventId, { token: ctx.token })
    }),
  draft: router({
    list: publicProcedure.output(z.array(Draft)).query(async (options) => {
      return getDraftsByUserId(options.ctx.user.id)
    }),
    create: publicProcedure.input(DraftInput).mutation(async (options) => {
      const eventId = options.input.eventId
      await getEventById(eventId)
      return createDraft(options.input, {
        eventId,
        createdBy: options.ctx.user.id,
        createdAtLocation: options.ctx.user.primaryOfficeId,
        token: options.ctx.token,
        transactionId: options.input.transactionId
      })
    })
  }),
  actions: router({
    notify: router(getDefaultActionProcedures(ActionType.NOTIFY)),
    declare: router(getDefaultActionProcedures(ActionType.DECLARE)),
    validate: router(getDefaultActionProcedures(ActionType.VALIDATE)),
    reject: router(getDefaultActionProcedures(ActionType.REJECT)),
    archive: router(getDefaultActionProcedures(ActionType.ARCHIVE)),
    register: router(getDefaultActionProcedures(ActionType.REGISTER)),
    printCertificate: router(
      getDefaultActionProcedures(ActionType.PRINT_CERTIFICATE)
    ),
    assignment: router({
      assign: publicProcedure
        .input(AssignActionInput)
        .use(middleware.validateAction(ActionType.ASSIGN))
        .mutation(async (options) => {
          return assignRecord({
            input: options.input,
            createdBy: options.ctx.user.id,
            createdAtLocation: options.ctx.user.primaryOfficeId,
            token: options.ctx.token
          })
        }),
      unassign: publicProcedure
        .input(UnassignActionInput)
        .use(middleware.validateAction(ActionType.UNASSIGN))
        .mutation(async (options) => {
          return unassignRecord(options.input, {
            eventId: options.input.eventId,
            createdBy: options.ctx.user.id,
            createdAtLocation: options.ctx.user.primaryOfficeId,
            token: options.ctx.token,
            transactionId: options.input.transactionId
          })
        })
    }),
    correction: router({
      request: publicProcedure
        .use(
          requiresAnyOfScopes(
            ACTION_ALLOWED_SCOPES[ActionType.REQUEST_CORRECTION]
          )
        )
        .input(RequestCorrectionActionInput)
        .use(middleware.requireAssignment)
        .use(middleware.validateAction(ActionType.REQUEST_CORRECTION))
        .mutation(async ({ input, ctx }) => {
          if (ctx.isDuplicateAction) {
            return ctx.event
          }

          return addAction(input, {
            eventId: input.eventId,
            createdBy: ctx.user.id,
            createdAtLocation: ctx.user.primaryOfficeId,
            token: ctx.token,
            transactionId: input.transactionId,
            status: ActionStatus.Accepted
          })
        }),
      approve: publicProcedure
        .use(
          requiresAnyOfScopes(
            ACTION_ALLOWED_SCOPES[ActionType.APPROVE_CORRECTION]
          )
        )
        .input(ApproveCorrectionActionInput)
        .use(middleware.requireAssignment)
        .use(middleware.validateAction(ActionType.APPROVE_CORRECTION))
        .mutation(async ({ input, ctx }) => {
          if (ctx.isDuplicateAction) {
            return ctx.event
          }
          return approveCorrection(input, {
            eventId: input.eventId,
            createdBy: ctx.user.id,
            createdAtLocation: ctx.user.primaryOfficeId,
            token: ctx.token,
            transactionId: input.transactionId
          })
        }),
      reject: publicProcedure
        .use(
          requiresAnyOfScopes(
            ACTION_ALLOWED_SCOPES[ActionType.REJECT_CORRECTION]
          )
        )
        .input(RejectCorrectionActionInput)
        .use(middleware.requireAssignment)
        .mutation(async ({ input, ctx }) => {
          if ('isDuplicateAction' in ctx && ctx.isDuplicateAction) {
            return 'event' in ctx ? ctx.event : getEventById(input.eventId)
          }
          return rejectCorrection(input, {
            eventId: input.eventId,
            createdBy: ctx.user.id,
            createdAtLocation: ctx.user.primaryOfficeId,
            token: ctx.token,
            transactionId: input.transactionId
          })
        })
    })
  }),
  list: publicProcedure
    .use(requiresAnyOfScopes(ACTION_ALLOWED_SCOPES[ActionType.READ]))
    .output(z.array(EventIndex))
    .query(getIndexedEvents),
  search: publicProcedure.input(EventSearchIndex).query(async ({ input }) => {
    return getIndex(input)
  })
})
