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

import {
  DecorateMutationProcedure,
  inferInput,
  inferOutput,
  TRPCMutationOptions
} from '@trpc/tanstack-react-query'
import {
  EventConfig,
  EventDocument,
  EventIndex,
  getEventConfiguration
} from '@opencrvs/commons/client'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import { cacheFiles } from '@client/v2-events/features/files/cache'
import { queryClient, useTRPC, utils } from '@client/v2-events/trpc'
import { setQueryDefaults } from './api'
import { useEventAction } from './procedures/action'
import { useCreateEvent } from './procedures/create'
import { useDeleteEvent } from './procedures/delete'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPendingMutations<T extends DecorateMutationProcedure<any>>(
  mutation: T
) {
  // type MutationFn = Exclude<T['mutationFn'], undefined>
  type Data = inferOutput<T>
  type Variables = inferInput<T>

  const mutationOptions = mutation.mutationOptions()
  const key = mutationOptions.mutationKey

  return queryClient
    .getMutationCache()
    .getAll()
    .filter((mutation) => mutation.state.status !== 'success')
    .filter(
      (mutation) =>
        mutation.options.mutationKey &&
        hashKey(mutation.options.mutationKey) === hashKey(key)
    ) as Mutation<Data, Error, Variables>[]
}

function filterOutboxEventsWithMutation<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends DecorateMutationProcedure<any>
>(
  events: EventIndex[],
  mutation: T,
  filter: (event: EventIndex, parameters: inferInput<T>) => boolean
) {
  return getPendingMutations(mutation).flatMap((m) => {
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

setQueryDefaults(utils.event.get, {
  queryFn: async (...params) => {
    const {
      meta,
      queryKey: [, input]
    } = params[0]
    if (!meta) {
      throw new Error(
        'api.event.get was called without passing mandatory event configuration'
      )
    }

    const queryOptions = utils.event.get.queryOptions(input.input)

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
})

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
      trpc.event.actions.declare,
      (event, parameters) => {
        return event.id === parameters.eventId && !parameters.draft
      }
    )

    const eventFromValidateActions = filterOutboxEventsWithMutation(
      eventsList,
      trpc.event.actions.validate,
      (event, parameters) => {
        return event.id === parameters.eventId && !parameters.draft
      }
    )

    const eventFromRegisterActions = filterOutboxEventsWithMutation(
      eventsList,
      trpc.event.actions.register,
      (event, parameters) => {
        return event.id === parameters.eventId && !parameters.draft
      }
    )

    return eventFromDeclareActions
      .concat(eventFromDeclareActions)
      .concat(eventFromValidateActions)
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
        // Skip the queryFn defined by tRPC and use our own default defined above
        const { queryFn, ...options } = trpc.event.get.queryOptions(id)

        return useQuery({
          ...options,
          queryKey: trpc.event.get.queryKey(id),
          meta: {
            eventConfig
          }
        })
      },
      useSuspenseQuery: (id: string) => {
        const eventConfig = useEventConfigurations()
        // Skip the queryFn defined by tRPC and use our own default defined above
        const { queryFn, ...options } = trpc.event.get.queryOptions(id)

        return [
          useSuspenseQuery({
            ...options,
            queryKey: trpc.event.get.queryKey(id),
            meta: {
              eventConfig
            }
          }).data
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
