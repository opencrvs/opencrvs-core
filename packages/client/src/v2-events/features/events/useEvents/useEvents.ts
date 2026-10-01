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
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import {
  ActionType,
  SearchQuery,
  UUID,
  getCurrentEventState,
  getUUID,
  EventDocument,
  getOrThrow,
  applyDraftToEventIndex,
  EventConfig,
  Draft
} from '@opencrvs/commons/client'
import { useTRPC } from '@client/v2-events/trpc'
import { useDrafts } from '../../drafts/useDrafts'
import { useEventConfigurations } from '../useEventConfiguration'
import { useGetEvent } from './procedures/get'
import { useOutbox } from './outbox'
import { useCreateEvent } from './procedures/create'
import { useDeleteEvent } from './procedures/delete'
import { useEventAction, useIsMutating } from './procedures/actions/action'
import { useEventCustomAction } from './procedures/actions/customAction'
import { useGetEventCountsByWorkqueue } from './procedures/count'
import { findLocalEventDocument, findLocalEventIndex } from './api'
import { QueryOptions } from './procedures/utils'
import {
  byIdSearchOptions,
  scopedSearchOptions,
  SearchScope
} from './procedures/search'

function getEventWithDraftOrThrow(
  id: string,
  eventConfigs: EventConfig[],
  maybeDraft: Draft | undefined
): { event: EventDocument; draft: Draft; configuration: EventConfig } {
  const event = findLocalEventDocument(id)

  if (!event || !maybeDraft) {
    throw new Error(`No event or draft found with id: ${id}`)
  }

  const configuration = getOrThrow(
    eventConfigs.find(({ id: cfgId }) => cfgId === event.type),
    `Event configuration not found for ${event.type}`
  )

  return { event, draft: maybeDraft, configuration }
}

function buildDraftedEventResult(
  event: EventDocument,
  draft: Draft,
  configuration: EventConfig
) {
  const currentEventState = getCurrentEventState(event, configuration)
  return {
    results: [applyDraftToEventIndex(currentEventState, draft, configuration)],
    total: 1
  }
}

export function useEvents() {
  const trpc = useTRPC()
  const getEvent = useGetEvent()
  const assignMutation = useEventAction(trpc.event.actions.assignment.assign)
  const eventConfigs = useEventConfigurations()
  const { getRemoteDraftByEventId } = useDrafts()

  /** The result for a record the server has not indexed yet, from its draft. */
  function buildDraftedResult(id: string, maybeDraft: Draft | undefined) {
    const { event, draft, configuration } = getEventWithDraftOrThrow(
      id,
      eventConfigs,
      maybeDraft
    )
    return buildDraftedEventResult(event, draft, configuration)
  }

  return {
    createEvent: useCreateEvent,
    /** Returns an event with full history. If you only need the state of the event, use getEventState. */
    getEvent,
    useGetEventCountsByWorkqueue,
    deleteEvent: {
      useMutation: useDeleteEvent
    },
    getOutbox: useOutbox,
    searchEvent: {
      useQuery: (
        query: SearchQuery,
        scope: SearchScope,
        options: QueryOptions<typeof trpc.event.search> = {}
      ) => {
        return useQuery({
          ...scopedSearchOptions(query, scope),
          refetchOnMount: 'always',
          staleTime: 0,
          ...options
        })
      },
      useSuspenseQuery: (
        query: SearchQuery,
        scope: SearchScope,
        options: QueryOptions<typeof trpc.event.search> = {}
      ) => {
        return useSuspenseQuery({
          ...scopedSearchOptions(query, scope),
          refetchOnMount: 'always',
          staleTime: 0,
          ...options
        }).data
      }
    },
    searchEventById: {
      useQuery: (id: string) => {
        const maybeDraft = getRemoteDraftByEventId(id)

        return useQuery({
          ...byIdSearchOptions(id, () => buildDraftedResult(id, maybeDraft)),
          enabled: !findLocalEventIndex(id),
          refetchOnMount: 'always',
          staleTime: 0,
          initialData: () => {
            const eventIndex = findLocalEventIndex(id)
            return eventIndex ? { results: [eventIndex], total: 1 } : undefined
          }
        })
      },
      useSuspenseQuery: (id: string) => {
        const maybeDraft = getRemoteDraftByEventId(id)

        return useSuspenseQuery({
          ...byIdSearchOptions(id, () => buildDraftedResult(id, maybeDraft)),
          refetchOnMount: 'always',
          staleTime: 0,
          initialData: () => {
            const eventIndex = findLocalEventIndex(id)
            return eventIndex ? { results: [eventIndex], total: 1 } : undefined
          }
        }).data
      }
    },
    actions: {
      custom: useEventAction(trpc.event.actions.custom.request),
      reject: useEventAction(trpc.event.actions.reject.request),
      archive: useEventAction(trpc.event.actions.archive.request),
      unarchive: useEventAction(trpc.event.actions.unarchive.request),
      notify: useEventAction(trpc.event.actions.notify.request),
      declare: useEventAction(trpc.event.actions.declare.request),
      register: useEventAction(trpc.event.actions.register.request),
      correction: {
        request: useEventAction(trpc.event.actions.correction.request.request),
        approve: useEventAction(trpc.event.actions.correction.approve.request),
        reject: useEventAction(trpc.event.actions.correction.reject.request)
      },
      assignment: {
        assign: {
          isAssigning: (eventId: UUID) => {
            return useIsMutating(eventId, trpc.event.actions.assignment.assign)
          },
          mutate: async ({
            eventId,
            assignedTo,
            refetchEvent
          }: {
            eventId: string
            assignedTo: string
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            refetchEvent: () => Promise<any>
          }) => {
            /**This makes sure all the files and users referenced in the event document is prefetched to be used even in offline */
            await refetchEvent()

            return assignMutation.mutate({
              type: ActionType.ASSIGN,
              eventId,
              transactionId: getUUID(),
              assignedTo
            })
          }
        },
        unassign: useEventAction(trpc.event.actions.assignment.unassign)
      },
      duplicate: {
        markAsDuplicate: useEventAction(
          trpc.event.actions.duplicate.markAsDuplicate
        ),
        markNotDuplicate: useEventAction(
          trpc.event.actions.duplicate.markNotDuplicate
        )
      }
    },
    onlineActions: {
      printCertificate: useEventAction(
        trpc.event.actions.printCertificate.request
      )
    },
    customActions: {
      registerOnDeclare: useEventCustomAction('registerOnDeclare'),
      archiveOnDuplicate: useEventCustomAction('archiveOnDuplicate'),
      makeCorrectionOnRequest: useEventCustomAction('makeCorrectionOnRequest'),
      editAndRegister: useEventCustomAction('editAndRegister'),
      editAndDeclare: useEventCustomAction('editAndDeclare'),
      editAndNotify: useEventCustomAction('editAndNotify')
    }
  }
}
