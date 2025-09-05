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
import { first } from 'lodash'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'

import {
  QueryType,
  SearchQuery,
  UUID,
  getCurrentEventState,
  getUUID,
  EventDocument,
  getOrThrow,
  applyDraftToEventIndex
} from '@opencrvs/commons/client'
import { useTRPC } from '@client/v2-events/trpc'
import { useDrafts } from '../../drafts/useDrafts'
import { useEventConfigurations } from '../useEventConfiguration'
import { prefetchPotentialDuplicates } from '../actions/dedup/getDuplicates'
import { useGetEvent } from './procedures/get'
import { useOutbox } from './outbox'
import { useCreateEvent } from './procedures/create'
import { useDeleteEvent } from './procedures/delete'
import {
  useEventAction,
  useEventCustomAction,
  useIsMutating
} from './procedures/actions/action'
import { useGetEvents } from './procedures/list'
import { useGetEventCounts } from './procedures/count'
import { findLocalEventDocument, findLocalEventIndex } from './api'
import { QueryOptions } from './procedures/utils'

export function useEvents() {
  const trpc = useTRPC()
  const getEvent = useGetEvent()
  const getEvents = useGetEvents()
  const assignMutation = useEventAction(trpc.event.actions.assignment.assign)
  const eventConfigs = useEventConfigurations()
  const { getAllRemoteDrafts } = useDrafts()

  const drafts = getAllRemoteDrafts({
    refetchOnMount: 'always',
    staleTime: 0,
    refetchInterval: 20000
  })

  return {
    createEvent: useCreateEvent,
    /** Returns an event with full history. If you only need the state of the event, use getEventState. */
    getEvent,
    getEvents,
    useGetEventCounts,
    deleteEvent: {
      useMutation: useDeleteEvent
    },
    getOutbox: useOutbox,
    searchEvent: {
      useQuery: (
        query: SearchQuery,
        options: QueryOptions<typeof trpc.event.search> = {}
      ) => {
        return useQuery({
          ...trpc.event.search.queryOptions(query),
          queryKey: trpc.event.search.queryKey(query),
          refetchOnMount: 'always',
          staleTime: 0,
          ...options
        })
      },
      useSuspenseQuery: (
        query: SearchQuery,
        options: QueryOptions<typeof trpc.event.search> = {}
      ) => {
        return useSuspenseQuery({
          ...trpc.event.search.queryOptions(query),
          queryKey: trpc.event.search.queryKey(query),
          refetchOnMount: 'always',
          staleTime: 0,
          ...options
        }).data
      }
    },
    searchEventById: {
      useQuery: (id: string) => {
        const query = {
          type: 'and',
          clauses: [{ id }]
        } satisfies QueryType

        const options = trpc.event.search.queryOptions({ query })

        return useQuery({
          ...options,
          queryKey: trpc.event.search.queryKey({ query }),
          enabled: !findLocalEventIndex(id),
          staleTime: 0,
          refetchOnMount: 'always',
          queryFn: async (...args) => {
            // Try Elasticsearch first
            const queryFn = options.queryFn
            if (!queryFn) {
              throw new Error('Query function is not defined')
            }

            const res = await queryFn(...args)
            if (res.total > 0) {
              return res
            }

            // Search for drafts if record is not found in ES
            const eventsWithDrafts = drafts
              .map(({ eventId }) => findLocalEventDocument(eventId))
              .filter((event): event is EventDocument => !!event)
              .map((event) => {
                const draft = first(
                  drafts.filter((d) => d.eventId === event.id)
                )
                const configuration = getOrThrow(
                  eventConfigs.find(
                    ({ id: eventConfigId }) => eventConfigId === event.type
                  ),
                  `Event configuration not found for ${event.type}`
                )

                const currentEventState = getCurrentEventState(
                  event,
                  configuration
                )
                return draft
                  ? applyDraftToEventIndex(
                      currentEventState,
                      draft,
                      configuration
                    )
                  : currentEventState
              })

            const eventState = eventsWithDrafts.find((event) => event.id === id)
            if (eventState) {
              return {
                results: [eventState],
                total: 1
              }
            }

            // Nothing found → throw
            throw new Error(`No event or draft found with id: ${id}`)
          },
          initialData: () => {
            const eventIndex = findLocalEventIndex(id)
            return eventIndex ? { results: [eventIndex], total: 1 } : undefined
          }
        })
      },
      useSuspenseQuery: (id: string) => {
        const query = {
          type: 'and',
          clauses: [{ id }]
        } satisfies QueryType

        const options = trpc.event.search.queryOptions({ query })

        return useSuspenseQuery({
          ...options,
          queryKey: trpc.event.search.queryKey({ query }),
          queryFn: async (...args) => {
            // Try Elasticsearch first
            const queryFn = options.queryFn
            if (!queryFn) {
              throw new Error('Query function is not defined')
            }
            const res = await queryFn(...args)
            if (res.total > 0) {
              return res
            }

            // Search for drafts if record is not found in ES
            const eventsWithDrafts = drafts
              .map(({ eventId }) => findLocalEventDocument(eventId))
              .filter((event): event is EventDocument => !!event)
              .map((event) => {
                const draft = first(
                  drafts.filter((d) => d.eventId === event.id)
                )
                const configuration = getOrThrow(
                  eventConfigs.find(
                    ({ id: eventConfigId }) => eventConfigId === event.type
                  ),
                  `Event configuration not found for ${event.type}`
                )

                const currentEventState = getCurrentEventState(
                  event,
                  configuration
                )
                return draft
                  ? applyDraftToEventIndex(
                      currentEventState,
                      draft,
                      configuration
                    )
                  : currentEventState
              })

            const eventState = eventsWithDrafts.find((event) => event.id === id)
            if (eventState) {
              return {
                results: [eventState],
                total: 1
              }
            }

            // Nothing found → throw
            throw new Error(`No event or draft found with id: ${id}`)
          },
          initialData: () => {
            const eventIndex = findLocalEventIndex(id)
            return eventIndex ? { results: [eventIndex], total: 1 } : undefined
          }
        }).data
      }
    },
    actions: {
      validate: useEventAction(trpc.event.actions.validate.request),
      reject: useEventAction(trpc.event.actions.reject.request),
      archive: useEventAction(trpc.event.actions.archive.request),
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

            await assignMutation.mutateAsync({
              eventId,
              transactionId: getUUID(),
              assignedTo
            })
            await prefetchPotentialDuplicates(eventId)
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
      validateOnDeclare: useEventCustomAction('validateOnDeclare'),
      registerOnValidate: useEventCustomAction('registerOnValidate'),
      archiveOnDuplicate: useEventCustomAction('archiveOnDuplicate'),
      makeCorrectionOnRequest: useEventCustomAction('makeCorrectionOnRequest')
    }
  }
}
