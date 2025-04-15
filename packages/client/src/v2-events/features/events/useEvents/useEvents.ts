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

import { QueryInputType, QueryType, getUUID } from '@opencrvs/commons/client'
import { useTRPC } from '@client/v2-events/trpc'
import { useGetEvent, useGetEventState } from './procedures/get'
import { useOutbox } from './outbox'
import { useCreateEvent } from './procedures/create'
import { useDeleteEvent } from './procedures/delete'
import {
  customMutationKeys,
  useEventAction,
  useEventCustomAction
} from './procedures/actions/action'
import { useGetEvents } from './procedures/list'

function toQueryType(
  eventType: string,
  searchParams: QueryInputType,
  type: 'and' | 'or'
): QueryType {
  return type === 'and'
    ? {
        type: 'and',
        eventType,
        data: searchParams
      }
    : {
        type: 'or',
        clauses: [
          {
            type: 'and',
            eventType,
            data: searchParams
          }
        ]
      }
}

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
    /** Returns an event with aggregated history. If you need the history of the event, use getEvent. */
    getEventState: useGetEventState(),
    deleteEvent: {
      useMutation: useDeleteEvent
    },
    getOutbox: useOutbox,
    searchEvent: {
      useQuery: (
        eventType: string,
        searchParams: Record<string, string>,
        queryType: 'and' | 'or'
      ) => {
        const input = toQueryType(eventType, searchParams, queryType)
        return useQuery({
          ...trpc.event.search.queryOptions(input),
          queryKey: trpc.event.search.queryKey(input)
        })
      },
      useSuspenseQuery: (
        eventType: string,
        searchParams: QueryInputType,
        queryType: 'and' | 'or'
      ) => {
        const input = toQueryType(eventType, searchParams, queryType)
        return useSuspenseQuery({
          ...trpc.event.search.queryOptions(input),
          queryKey: trpc.event.search.queryKey(input)
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
