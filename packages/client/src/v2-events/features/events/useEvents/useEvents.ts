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
  hashKey,
  Mutation,
  useQuery,
  useSuspenseQuery
} from '@tanstack/react-query'

import { TRPCMutationOptions } from '@trpc/tanstack-react-query'
import {
  EventConfig,
  EventDocument,
  EventIndex,
  getEventConfiguration
} from '@opencrvs/commons/client'
import { cacheFiles } from '@client/v2-events/features/files/cache'
import { queryClient, useTRPC } from '@client/v2-events/trpc'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventAction } from './procedures/action'
import { useCreateEvent } from './procedures/create'
import { useDeleteEvent } from './procedures/delete'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPendingMutations<T extends ReturnType<TRPCMutationOptions<any>>>(
  queryOptions: T
) {
  type MutationFn = Exclude<T['mutationFn'], undefined>
  type Data = ReturnType<MutationFn>
  type Variables = Parameters<MutationFn>[0]
  type Context = Parameters<MutationFn>[1]
  const key = queryOptions.mutationKey

  return queryClient
    .getMutationCache()
    .getAll()
    .filter((mutation) => mutation.state.status !== 'success')
    .filter(
      (mutation) =>
        mutation.options.mutationKey &&
        hashKey(mutation.options.mutationKey) === hashKey(key)
    ) as Mutation<Data, Error, Variables, Context>[]
}

function filterOutboxEventsWithMutation<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ReturnType<TRPCMutationOptions<any>>
>(
  events: EventIndex[],
  mutationOptions: T,
  filter: (
    event: EventIndex,
    parameters: Parameters<Exclude<T['mutationFn'], undefined>>[0]
  ) => boolean
) {
  return getPendingMutations(mutationOptions).flatMap((m) => {
    const variables = m.state.variables
    return events.filter((event) => filter(event, variables))
  })
}

/*
 * This logic overrides the default behaviour of "api.event.get"
 * by making it so all "FILE" or "FILE_WITH_OPTIONS" type data points
 * are parsed from the received event document and prefetched as part of fetching the record
 *
 * This ensures the full record can be browsed even when the user goes offline
 */

type GetEventQueryOptions = ReturnType<
  typeof useTRPC
>['event']['get']['queryOptions']
type QueryOptions = ReturnType<GetEventQueryOptions>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any
type QueryFnParams = Parameters<Extract<QueryOptions['queryFn'], AnyFn>>

function precacheAttachments<T extends QueryOptions>(queryOptions: T) {
  return {
    ...queryOptions,
    queryFn: async (...params: QueryFnParams) => {
      const { meta } = params[0]
      if (!meta) {
        throw new Error(
          'api.event.get was called without passing mandatory event configuration'
        )
      }

      if (typeof queryOptions.queryFn !== 'function') {
        throw new Error('queryFn is not a function')
      }
      /*
       * This is a query directly to the tRPC server
       */
      const response = await queryOptions.queryFn(...params)

      const eventDocument = EventDocument.parse(response)

      const eventConfig = getEventConfiguration(
        meta.eventConfig as EventConfig[],
        eventDocument.type
      )

      await cacheFiles(eventDocument, eventConfig)
      return eventDocument
    }
  }
}

export function useEvents() {
  const trpc = useTRPC()
  const eventListQuery = useQuery({
    ...trpc.event.list.queryOptions(),
    queryKey: trpc.event.list.queryKey()
  })

  const eventsList = eventListQuery.data ?? []

  function getDrafts(): EventDocument[] {
    const queries = queryClient.getQueriesData<EventDocument>({
      queryKey: trpc.event.get.queryKey(undefined)
    })

    return queries
      .map((query) => query[1])
      .filter((event): event is EventDocument =>
        Boolean(event && event.actions[event.actions.length - 1].draft)
      )
  }

  function getOutbox() {
    const eventFromDeclareActions = filterOutboxEventsWithMutation(
      eventsList,
      trpc.event.actions.declare.mutationOptions(undefined),
      (event, parameters) => {
        return event.id === parameters.eventId && !parameters.draft
      }
    )

    const eventFromRegisterActions = filterOutboxEventsWithMutation(
      eventsList,
      trpc.event.actions.declare.mutationOptions(undefined),
      (event, parameters) => {
        return event.id === parameters.eventId && !parameters.draft
      }
    )

    return eventFromDeclareActions
      .concat(eventFromDeclareActions)
      .concat(eventFromRegisterActions)
      .filter(
        /* uniqueById */
        (e, i, arr) => arr.findIndex((a) => a.id === e.id) === i
      )
  }

  return {
    createEvent: useCreateEvent,
    getEvent: {
      useQuery: (id: string) => {
        const eventConfig = useEventConfigurations()

        return useQuery(
          precacheAttachments({
            ...trpc.event.get.queryOptions(id),
            queryKey: trpc.event.get.queryKey(id),
            meta: {
              eventConfig
            }
          })
        )
      },
      useSuspenseQuery: (id: string) => {
        const eventConfig = useEventConfigurations()

        return [
          useSuspenseQuery(
            precacheAttachments({
              ...trpc.event.get.queryOptions(id),
              queryKey: trpc.event.get.queryKey(id),
              meta: {
                eventConfig
              }
            })
          ).data
        ]
      }
    },
    getEvents: {
      useQuery: () => eventListQuery,
      useSuspenseQuery: () => [
        useSuspenseQuery({
          ...trpc.event.list.queryOptions(),
          queryKey: trpc.event.list.queryKey()
        }).data
      ]
    },
    deleteEvent: {
      useMutation: useDeleteEvent
    },
    getOutbox,
    getDrafts,
    actions: {
      validate: useEventAction(trpc.event.actions.validate),
      notify: useEventAction(trpc.event.actions.notify),
      declare: useEventAction(trpc.event.actions.declare),
      register: useEventAction(trpc.event.actions.register),
      printCertificate: useEventAction(trpc.event.actions.printCertificate),
      correction: {
        request: useEventAction(trpc.event.actions.correction.request),
        approve: useEventAction(trpc.event.actions.correction.approve),
        reject: useEventAction(trpc.event.actions.correction.reject)
      }
    }
  }
}
