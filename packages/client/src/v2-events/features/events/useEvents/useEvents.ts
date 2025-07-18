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

import {
  useQuery,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query'

import { useSyncExternalStore } from 'react'
import { EventIndex, QueryType, UUID, getUUID } from '@opencrvs/commons/client'
import { queryClient, useTRPC } from '@client/v2-events/trpc'
import { useGetEvent } from './procedures/get'
import { useOutbox } from './outbox'
import { useCreateEvent } from './procedures/create'
import { useDeleteEvent } from './procedures/delete'
import {
  customMutationKeys,
  useEventAction,
  useEventCustomAction,
  useIsMutating
} from './procedures/actions/action'
import { useGetEvents } from './procedures/list'
import { useGetEventCounts } from './procedures/count'
import { findLocalEventIndex } from './api'
import { MutationType, QueryOptions } from './procedures/utils'

export function useEvents() {
  const trpc = useTRPC()
  const getEvent = useGetEvent()
  const getEvents = useGetEvents()
  const assignMutation = useEventAction(trpc.event.actions.assignment.assign)
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
      useQuery: (query: QueryType) => {
        return useQuery({
          ...trpc.event.search.queryOptions(query),
          queryKey: trpc.event.search.queryKey(query),
          refetchOnMount: true,
          staleTime: 0
        })
      },
      useSuspenseQuery: (
        query: QueryType,
        options: QueryOptions<typeof trpc.event.search> = {}
      ) => {
        return useSuspenseQuery({
          ...trpc.event.search.queryOptions(query),
          queryKey: trpc.event.search.queryKey(query),
          refetchOnMount: true,
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

        const options = trpc.event.search.queryOptions(query)

        return useQuery({
          ...options,
          queryKey: trpc.event.search.queryKey(query),
          enabled: !findLocalEventIndex(id),
          staleTime: 0,
          refetchOnMount: true,
          queryFn: async (...args) => {
            const queryFn = options.queryFn
            if (!queryFn) {
              throw new Error('Query function is not defined')
            }
            const res = await queryFn(...args)
            if (res.length === 0) {
              throw new Error(`No event found with id: ${id}`)
            }
            return res
          },
          initialData: () => {
            const eventIndex = findLocalEventIndex(id)
            return eventIndex ? [eventIndex] : undefined
          }
        })
      },
      useSuspenseQuery: (id: string) => {
        const query = {
          type: 'and',
          clauses: [{ id }]
        } satisfies QueryType

        const options = trpc.event.search.queryOptions(query)

        return useSuspenseQuery({
          ...options,
          queryKey: trpc.event.search.queryKey(query),
          queryFn: async (...args) => {
            const queryFn = options.queryFn
            if (!queryFn) {
              throw new Error('Query function is not defined')
            }
            const res = await queryFn(...args)
            if (res.length === 0) {
              throw new Error(`No event found with id: ${id}`)
            }
            return res
          },
          initialData: () => {
            const eventIndex = findLocalEventIndex(id)
            return eventIndex ? [eventIndex] : undefined
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
        request: useEventAction(trpc.event.actions.correction.request),
        approve: useEventAction(trpc.event.actions.correction.approve),
        reject: useEventAction(trpc.event.actions.correction.reject)
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
              eventId,
              transactionId: getUUID(),
              assignedTo
            })
          }
        },
        unassign: useEventAction(trpc.event.actions.assignment.unassign)
      }
    },
    onlineActions: {
      printCertificate: useEventAction(
        trpc.event.actions.printCertificate.request
      )
    },
    customActions: {
      registerOnDeclare: useEventCustomAction([
        ...customMutationKeys.registerOnDeclare
      ]),
      validateOnDeclare: useEventCustomAction([
        ...customMutationKeys.validateOnDeclare
      ]),
      registerOnValidate: useEventCustomAction([
        ...customMutationKeys.registerOnValidate
      ])
    }
  }
}
