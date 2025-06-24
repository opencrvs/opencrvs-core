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

import { z } from 'zod'
import { extendZodWithOpenApi } from 'zod-openapi'
import { TRPCError } from '@trpc/server'
import { getScopes, getUUID, SCOPES, findScope } from '@opencrvs/commons'
import {
  ACTION_ALLOWED_SCOPES,
  ActionStatus,
  ActionType,
  ApproveCorrectionActionInput,
  AssignActionInput,
  CONFIG_GET_ALLOWED_SCOPES,
  CONFIG_SEARCH_ALLOWED_SCOPES,
  DeleteActionInput,
  Draft,
  DraftInput,
  EventConfig,
  EventDocument,
  EventIndex,
  EventInput,
  RejectCorrectionActionInput,
  RequestCorrectionActionInput,
  UnassignActionInput,
  ACTION_ALLOWED_CONFIGURABLE_SCOPES,
  QueryType
} from '@opencrvs/commons/events'
import * as middleware from '@events/router/middleware'
import { requiresAnyOfScopes } from '@events/router/middleware/authorization'
import { publicProcedure, router, systemProcedure } from '@events/router/trpc'
import {
  getEventConfigurationById,
  getEventConfigurations
} from '@events/service/config/config'
import { approveCorrection } from '@events/service/events/actions/approve-correction'
import { assignRecord } from '@events/service/events/actions/assign'
import { rejectCorrection } from '@events/service/events/actions/reject-correction'
import { unassignRecord } from '@events/service/events/actions/unassign'
import { createDraft, getDraftsByUserId } from '@events/service/events/drafts'
import {
  addAction,
  createEvent,
  deleteEvent,
  getEventById,
  throwConflictIfActionNotAllowed
} from '@events/service/events/events'
import { importEvent } from '@events/service/events/import'
import { getIndex, getIndexedEvents } from '@events/service/indexing/indexing'
import { getDefaultActionProcedures } from './actions'

extendZodWithOpenApi(z)

export const eventRouter = router({
  config: router({
    get: publicProcedure
      .meta({
        openapi: {
          summary: 'List event configurations',
          method: 'GET',
          path: '/config',
          tags: ['events'],
          protect: true
        }
      })
      .use(requiresAnyOfScopes(CONFIG_GET_ALLOWED_SCOPES))
      .input(z.void())
      .output(z.array(EventConfig))
      .query(async (options) => {
        return getEventConfigurations(options.ctx.token)
      })
  }),
  create: systemProcedure
    .meta({
      openapi: {
        summary: 'Create event',
        method: 'POST',
        path: '/events',
        tags: ['events'],
        protect: true
      }
    })
    .use(
      requiresAnyOfScopes(
        ACTION_ALLOWED_SCOPES[ActionType.CREATE],
        ACTION_ALLOWED_CONFIGURABLE_SCOPES[ActionType.CREATE]
      )
    )
    .input(EventInput)
    .use(middleware.eventTypeAuthorization)
    .output(EventDocument)
    .mutation(async ({ input, ctx }) => {
      const config = await getEventConfigurationById({
        token: ctx.token,
        eventType: input.type
      })

      return createEvent({
        transactionId: input.transactionId,
        eventInput: input,
        user: ctx.user,
        config
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
          user: ctx.user,
          token: ctx.token,
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
      await throwConflictIfActionNotAllowed(input.eventId, ActionType.DELETE)
      return deleteEvent(input.eventId, { token: ctx.token })
    }),
  draft: router({
    list: publicProcedure.output(z.array(Draft)).query(async (options) => {
      return getDraftsByUserId(options.ctx.user.id)
    }),
    create: publicProcedure
      .input(DraftInput)
      .mutation(async ({ input, ctx }) => {
        const { eventId } = input
        await getEventById(eventId)

        return createDraft(input, {
          eventId,
          user: ctx.user,
          transactionId: input.transactionId
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
            user: options.ctx.user,
            token: options.ctx.token
          })
        }),
      unassign: publicProcedure
        .input(UnassignActionInput)
        .use(middleware.validateAction(ActionType.UNASSIGN))
        .mutation(async (options) => {
          return unassignRecord(options.input, {
            eventId: options.input.eventId,
            user: options.ctx.user,
            token: options.ctx.token
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
            user: ctx.user,
            token: ctx.token,
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
            user: ctx.user,
            token: ctx.token
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
        .use(middleware.validateAction(ActionType.REJECT_CORRECTION))
        .mutation(async ({ input, ctx }) => {
          if (ctx.isDuplicateAction) {
            return ctx.event
          }

          return rejectCorrection(input, {
            eventId: input.eventId,
            user: ctx.user,
            token: ctx.token
          })
        })
    })
  }),
  list: systemProcedure
    .use(requiresAnyOfScopes(ACTION_ALLOWED_SCOPES[ActionType.READ]))
    .output(z.array(EventIndex))
    .query(async ({ ctx }) => {
      const userId = ctx.user.id
      const eventConfigs = await getEventConfigurations(ctx.token)
      return getIndexedEvents(userId, eventConfigs)
    }),
  search: publicProcedure
    .meta({
      openapi: {
        summary: 'Search for events',
        method: 'GET',
        tags: ['Search'],
        path: '/events/search'
      }
    })
    // @todo: remove legacy scopes once all users are configured with new search scopes
    .use(requiresAnyOfScopes(CONFIG_SEARCH_ALLOWED_SCOPES))
    .input(QueryType)
    .use(middleware.requireSearchScope)
    .output(z.array(EventIndex))
    .query(async ({ input, ctx }) => {
      const eventConfigs = await getEventConfigurations(ctx.token)
      const scopes = getScopes({ Authorization: ctx.token })
      const searchScope = findScope(scopes, 'search')
      // Only to satisfy type checking, as findScope will return undefined if no scope is found
      if (!searchScope) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }
      const searchScopeOptions = searchScope.options
      return getIndex(
        input,
        eventConfigs,
        searchScopeOptions,
        ctx.user.primaryOfficeId
      )
    }),
  import: systemProcedure
    .use(requiresAnyOfScopes([SCOPES.RECORD_IMPORT]))
    .meta({
      openapi: {
        summary: 'Import full event record',
        method: 'POST',
        path: '/events/import',
        tags: ['events']
      }
    })
    .input(EventDocument)
    .output(EventDocument)
    .mutation(async ({ input, ctx }) => importEvent(input, ctx.token))
})
