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

import * as z from 'zod/v4'
import {
  getScopes,
  getUUID,
  SCOPES,
  RecordScopeV2
} from '@opencrvs/commons'
import {
  ActionStatus,
  ActionType,
  AssignActionInput,
  DeleteActionInput,
  Draft,
  DraftInput,
  EventConfig,
  EventDocument,
  EventIndex,
  EventInput,
  SearchQuery,
  UnassignActionInput,
  ACTION_SCOPE_MAP,
  MarkAsDuplicateActionInput,
  MarkNotDuplicateActionInput,
  ActionDocument
} from '@opencrvs/commons/events'
import * as middleware from '@events/router/middleware'
import { EventIdParam } from '@events/router/middleware'
import { requiresAnyOfScopes } from '@events/router/middleware/authorization'
import {
  userOnlyProcedure,
  router,
  userAndSystemProcedure
} from '@events/router/trpc'
import {
  getEventConfigurationById,
  getInMemoryEventConfigurations
} from '@events/service/config/config'
import { assignRecord } from '@events/service/events/actions/assign'
import { unassignRecord } from '@events/service/events/actions/unassign'
import { createDraft, getDraftsByUserId } from '@events/service/events/drafts'
import {
  processAction,
  createEvent,
  deleteEvent,
  getEventById,
  throwConflictIfActionNotAllowed
} from '@events/service/events/events'
import * as draftsRepo from '@events/storage/postgres/events/drafts'
import { bulkImportEvents } from '@events/service/events/import'
import { findRecordsByQuery } from '@events/service/indexing/indexing'
import { reindex } from '@events/service/events/reindex'
import { markAsDuplicate } from '@events/service/events/actions/mark-as-duplicate'
import { markNotDuplicate } from '@events/service/events/actions/mark-not-duplicate'
import { cleanupUnreferencedFiles } from '@events/service/files'
import { UserContext } from '../../context'
import { getDuplicateEvents } from '../../service/deduplication/deduplication'
import { declareActionProcedures } from './actions/declare'
import { getDefaultActionProcedures } from './actions'
import { customActionProcedures } from './actions/custom'

export const eventRouter = router({
  config: router({
    /**
     * Event configurations are intentionally available to all user types.
     * Some of the dynamic scopes require knowledge of available types.
     */
    get: userOnlyProcedure
      .meta({
        openapi: {
          summary: 'List event configurations',
          method: 'GET',
          path: '/config',
          tags: ['events'],
          protect: true
        }
      })
      .input(z.void())
      .output(z.array(EventConfig))
      .query(async (options) =>
        getInMemoryEventConfigurations(options.ctx.token)
      )
  }),
  create: userAndSystemProcedure
    .meta({
      openapi: {
        summary: 'Create event',
        method: 'POST',
        path: '/events',
        tags: ['events'],
        protect: true
      }
    })
    .use(requiresAnyOfScopes([], ACTION_SCOPE_MAP[ActionType.CREATE]))
    .input(EventInput)
    .use(middleware.requireLocationForSystemUserEventCreate)
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
        createdAtLocation: input.createdAtLocation,
        config
      })
    }),
  get: userAndSystemProcedure
    .meta({
      openapi: {
        summary: 'Fetch full event document',
        method: 'GET',
        path: '/events/{eventId}',
        tags: ['events'],
        protect: true
      }
    })
    .input(EventIdParam)
    .output(EventDocument)
    .use(middleware.userCanReadEventV2)
    .query(async ({ ctx }) => {
      const { eventId, eventType } = ctx
      const configuration = await getEventConfigurationById({
        token: ctx.token,
        eventType
      })

      const updatedEvent = await processAction(
        {
          type: ActionType.READ,
          eventId,
          transactionId: getUUID(),
          declaration: {}
        },
        {
          eventId,
          user: ctx.user,
          token: ctx.token,
          status: ActionStatus.Accepted,
          configuration
        }
      )

      return updatedEvent
    }),
  getDuplicates: userOnlyProcedure
    .use(requiresAnyOfScopes([], ['record.declared.review-duplicates']))
    .input(EventIdParam)
    .use(middleware.eventTypeAuthorization)
    .use(middleware.requireAssignment)
    .query(async ({ input, ctx }) => {
      const event = await getEventById(input.eventId)

      return getDuplicateEvents(event, ctx)
    }),
  delete: userOnlyProcedure
    .use(requiresAnyOfScopes([], ACTION_SCOPE_MAP[ActionType.DELETE]))
    .input(DeleteActionInput)
    .use(middleware.requireAssignment)
    .mutation(async ({ input, ctx }) => {
      if (ctx.existingAction) {
        return ctx.event
      }

      await throwConflictIfActionNotAllowed(
        input.eventId,
        ActionType.DELETE,
        ctx.token
      )
      return deleteEvent(input.eventId, { token: ctx.token })
    }),
  draft: router({
    list: userOnlyProcedure
      .output(z.array(Draft))
      .query(async (options) => getDraftsByUserId(options.ctx.user.id)),
    create: userOnlyProcedure
      .input(DraftInput)
      .use(middleware.requireAssignment)
      .output(Draft)
      .mutation(async ({ input, ctx }) => {
        const { eventId, type } = input

        // Consecutive middlewares lose some of the typing.
        const user = UserContext.parse(ctx.user)
        await throwConflictIfActionNotAllowed(eventId, type, ctx.token)

        const previousDraft = await draftsRepo.findLatestDraftForAction(
          eventId,
          user.id,
          input.type
        )

        if (previousDraft?.transactionId === input.transactionId) {
          return previousDraft
        }

        const currentDraft = await createDraft(input, {
          eventId,
          user,
          transactionId: input.transactionId
        })

        const event = await getEventById(eventId)

        const actionFromDraft = ActionDocument.safeParse({
          ...currentDraft.action,
          id: currentDraft.id
        })

        if (actionFromDraft.success) {
          event.actions.push(actionFromDraft.data)
        }

        await cleanupUnreferencedFiles(event, ctx.token)

        return currentDraft
      })
  }),
  actions: router({
    notify: router(getDefaultActionProcedures(ActionType.NOTIFY)),
    declare: router(declareActionProcedures()),
    edit: router(getDefaultActionProcedures(ActionType.EDIT)),
    reject: router(getDefaultActionProcedures(ActionType.REJECT)),
    archive: router(getDefaultActionProcedures(ActionType.ARCHIVE)),
    register: router(getDefaultActionProcedures(ActionType.REGISTER)),
    printCertificate: router(
      getDefaultActionProcedures(ActionType.PRINT_CERTIFICATE)
    ),
    custom: router(customActionProcedures()),
    assignment: router({
      assign: userOnlyProcedure
        .input(AssignActionInput)
        .use(middleware.validateAction)
        .mutation(async ({ ctx, input }) => {
          const { user, token } = ctx
          return assignRecord({ input, user, token })
        }),
      unassign: userOnlyProcedure
        .input(UnassignActionInput)
        .use(middleware.validateAction)
        .mutation(async ({ input, ctx }) => {
          const { user, token } = ctx
          return unassignRecord({ input, user, token })
        })
    }),
    correction: router({
      request: router(
        getDefaultActionProcedures(ActionType.REQUEST_CORRECTION)
      ),
      approve: router(
        getDefaultActionProcedures(ActionType.APPROVE_CORRECTION)
      ),
      reject: router(getDefaultActionProcedures(ActionType.REJECT_CORRECTION))
    }),
    duplicate: router({
      markAsDuplicate: userOnlyProcedure
        .input(MarkAsDuplicateActionInput)
        .use(middleware.validateAction)
        .mutation(async (options) => {
          const event = await getEventById(options.input.eventId)
          const configuration = await getEventConfigurationById({
            token: options.ctx.token,
            eventType: event.type
          })
          return markAsDuplicate(
            event,
            options.input,
            options.ctx.user,
            options.ctx.token,
            configuration
          )
        }),
      markNotDuplicate: userOnlyProcedure
        .input(MarkNotDuplicateActionInput)
        .use(middleware.validateAction)
        .mutation(async (options) => {
          const event = await getEventById(options.input.eventId)
          const configuration = await getEventConfigurationById({
            token: options.ctx.token,
            eventType: event.type
          })
          return markNotDuplicate(
            event,
            options.input,
            options.ctx.user,
            options.ctx.token,
            configuration
          )
        })
    })
  }),
  search: userAndSystemProcedure
    .meta({
      openapi: {
        summary: 'Search for events',
        method: 'POST',
        tags: ['Search'],
        path: '/events/search'
      }
    })
    // @todo: remove legacy scopes once all users are configured with new search scopes
    .use(
      requiresAnyOfScopes([SCOPES.RECORDSEARCH], undefined, ['record.search'])
    )
    .input(SearchQuery)
    .output(
      z.object({
        results: z.array(EventIndex),
        total: z.number()
      })
    )
    .query(async ({ input, ctx }) => {
      const eventConfigs = await getInMemoryEventConfigurations(ctx.token)
      const scopes = getScopes(ctx.token)

      const isRecordSearchSystemClient = scopes.includes(SCOPES.RECORDSEARCH)

      if (isRecordSearchSystemClient) {
        return findRecordsByQuery({
          search: input,
          eventConfigs,
          user: ctx.user,
          acceptedScopes: [
            {
              type: 'record.search',
              options: {}
            }
          ]
        })
      }

      if (ctx.acceptedScopes) {
        return findRecordsByQuery({
          search: input,
          eventConfigs,
          user: ctx.user,
          acceptedScopes: ctx.acceptedScopes as RecordScopeV2[]
        })
      }

      throw new Error('No search scope provided')
    }),
  bulkImport: userAndSystemProcedure
    .use(requiresAnyOfScopes([SCOPES.RECORD_IMPORT]))
    .meta({
      openapi: {
        summary: 'Import multiple full event records',
        method: 'POST',
        path: '/events/bulk-import',
        tags: ['events']
      }
    })
    .input(z.array(EventDocument))
    .output(z.any())
    .mutation(async ({ input, ctx }) => bulkImportEvents(input, ctx.token)),
  reindex: userAndSystemProcedure
    .input(z.void())
    .use(requiresAnyOfScopes([SCOPES.RECORD_REINDEX]))
    .output(z.void())
    .meta({
      openapi: {
        summary:
          'Triggers reindexing of search, workqueues and notifies country config',
        method: 'POST',
        path: '/events/reindex',
        tags: ['events']
      }
    })
    .mutation(async ({ ctx }) => {
      await reindex(ctx.token)
    })
})
