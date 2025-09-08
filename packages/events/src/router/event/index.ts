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
import {
  QueryProcedure,
  TRPCError
} from '@trpc/server/unstable-core-do-not-import'
import { OpenApiMeta } from 'trpc-to-openapi'
import { getScopes, getUUID, SCOPES, UUID, findScope } from '@opencrvs/commons'
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
  MarkNotDuplicateActionInput
} from '@opencrvs/commons/events'
import * as middleware from '@events/router/middleware'
import { EventIdParam } from '@events/router/middleware'
import { requiresAnyOfScopes } from '@events/router/middleware/authorization'
import { publicProcedure, router, systemProcedure } from '@events/router/trpc'
import {
  getEventConfigurationById,
  getInMemoryEventConfigurations
} from '@events/service/config/config'
import { assignRecord } from '@events/service/events/actions/assign'
import { unassignRecord } from '@events/service/events/actions/unassign'
import { createDraft, getDraftsByUserId } from '@events/service/events/drafts'
import {
  processAction,
  deleteUnreferencedFilesFromPreviousDrafts,
  createEvent,
  deleteEvent,
  getEventById,
  throwConflictIfActionNotAllowed
} from '@events/service/events/events'
import * as draftsRepo from '@events/storage/postgres/events/drafts'
import { importEvent } from '@events/service/events/import'
import {
  findRecordsByQuery,
  getIndexedEvents
} from '@events/service/indexing/indexing'
import { reindex } from '@events/service/events/reindex'
import { markAsDuplicate } from '@events/service/events/actions/mark-as-duplicate'
import { markNotDuplicate } from '@events/service/events/actions/mark-not-duplicate'
import { UserContext } from '../../context'
import { getDuplicateEvents } from '../../service/deduplication/deduplication'
import { declareActionProcedures } from './actions/declare'
import { getDefaultActionProcedures } from './actions'

extendZodWithOpenApi(z)

/*
 * Explicitely type the procedure to reduce the inference
 * thus avoiding "The inferred type of this node exceeds the maximum length the
 * compiler will serialize" error
 */
const eventConfigGetProcedure: QueryProcedure<{
  meta: OpenApiMeta
  input: void
  output: EventConfig[]
}> = publicProcedure
  .meta({
    openapi: {
      summary: 'List event configurations',
      method: 'GET',
      path: '/config',
      tags: ['events'],
      protect: true
    }
  })
  .use(
    requiresAnyOfScopes(
      [
        SCOPES.RECORD_READ,
        SCOPES.RECORD_SUBMIT_FOR_REVIEW,
        SCOPES.RECORD_EXPORT_RECORDS,
        SCOPES.CONFIG,
        SCOPES.CONFIG_UPDATE_ALL
      ],
      ['record.declare', 'record.notify', 'record.register']
    )
  )
  .input(z.void())
  .output(z.array(EventConfig))
  .query(async (options) => {
    return getInMemoryEventConfigurations(options.ctx.token)
  })

export const eventRouter = router({
  config: router({
    get: eventConfigGetProcedure
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
    .use(requiresAnyOfScopes([], ACTION_SCOPE_MAP[ActionType.CREATE]))
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
  get: publicProcedure
    .use(requiresAnyOfScopes([], ACTION_SCOPE_MAP[ActionType.READ]))
    .input(UUID)
    .query(async ({ input, ctx }) => {
      const event = await getEventById(input)

      if (!ctx.authorizedEntities?.events?.includes(event.type)) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const configuration = await getEventConfigurationById({
        token: ctx.token,
        eventType: event.type
      })
      const updatedEvent = await processAction(
        {
          type: ActionType.READ,
          eventId: event.id,
          transactionId: getUUID(),
          declaration: {}
        },
        {
          event,
          user: ctx.user,
          token: ctx.token,
          status: ActionStatus.Accepted,
          configuration
        }
      )

      return updatedEvent
    }),
  getDuplicates: publicProcedure
    .use(requiresAnyOfScopes([SCOPES.RECORD_REVIEW_DUPLICATES]))
    .input(EventIdParam)
    .use(middleware.requireAssignment)
    .query(async ({ input, ctx }) => {
      const event = await getEventById(input.eventId)

      return getDuplicateEvents(event, ctx)
    }),
  delete: publicProcedure
    .use(requiresAnyOfScopes([], ACTION_SCOPE_MAP[ActionType.DELETE]))
    .input(DeleteActionInput)
    .use(middleware.requireAssignment)
    .mutation(async ({ input, ctx }) => {
      if (ctx.isDuplicateAction) {
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
    list: publicProcedure
      .output(z.array(Draft))
      .query(async (options) => getDraftsByUserId(options.ctx.user.id)),
    create: publicProcedure
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
        const configuration = await getEventConfigurationById({
          token: ctx.token,
          eventType: event.type
        })

        if (previousDraft) {
          await deleteUnreferencedFilesFromPreviousDrafts(ctx.token, {
            event,
            configuration,
            currentDraft,
            previousDraft
          })
        }

        return currentDraft
      })
  }),
  actions: router({
    notify: router(getDefaultActionProcedures(ActionType.NOTIFY)),
    declare: router(declareActionProcedures()),
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
        .use(middleware.validateAction)
        .mutation(async ({ ctx, input }) => {
          const { user, token } = ctx
          return assignRecord({ input, user, token })
        }),
      unassign: publicProcedure
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
      markAsDuplicate: publicProcedure
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
      markNotDuplicate: publicProcedure
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
  list: systemProcedure
    .use(
      requiresAnyOfScopes([
        SCOPES.RECORD_READ,
        SCOPES.RECORD_SUBMIT_FOR_REVIEW,
        SCOPES.RECORD_REGISTER,
        SCOPES.RECORD_EXPORT_RECORDS
      ])
    )
    .output(z.array(EventIndex))
    .query(async ({ ctx }) => {
      const userId = ctx.user.id
      const eventConfigs = await getInMemoryEventConfigurations(ctx.token)

      return getIndexedEvents(userId, eventConfigs)
    }),
  search: systemProcedure
    .meta({
      openapi: {
        summary: 'Search for events',
        method: 'POST',
        tags: ['Search'],
        path: '/events/search'
      }
    })
    // @todo: remove legacy scopes once all users are configured with new search scopes
    .use(requiresAnyOfScopes([SCOPES.RECORDSEARCH], ['search']))
    .input(SearchQuery)
    .output(
      z.object({
        results: z.array(EventIndex),
        total: z.number()
      })
    )
    .query(async ({ input, ctx }) => {
      const eventConfigs = await getInMemoryEventConfigurations(ctx.token)
      const scopes = getScopes({ Authorization: ctx.token })
      const isRecordSearchSystemClient = scopes.includes(SCOPES.RECORDSEARCH)
      const allAccessForEveryEventType = Object.fromEntries(
        eventConfigs.map(({ id }) => [id, 'all' as const])
      )

      if (isRecordSearchSystemClient) {
        return findRecordsByQuery(
          input,
          eventConfigs,
          allAccessForEveryEventType,
          ctx.user.primaryOfficeId
        )
      }

      const searchScope = findScope(scopes, 'search')

      // Only to satisfy type checking, as findScope will return undefined if no scope is found
      if (!searchScope) {
        throw new Error('No search scope provided')
      }
      return findRecordsByQuery(
        input,
        eventConfigs,
        searchScope.options,
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
    .mutation(async ({ input, ctx }) => importEvent(input, ctx.token)),
  reindex: systemProcedure
    .input(z.void())
    .use(requiresAnyOfScopes([SCOPES.REINDEX]))
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
