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
  EventDocument,
  EventIndex,
  getCurrentEventState
} from '@opencrvs/commons/client'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import { cacheFiles } from '@client/v2-events/features/files/cache'
import { useTRPC, trpcOptionsProxy } from '@client/v2-events/trpc'
import { cacheUsersFromEventDocument } from '@client/v2-events/features/users/cache'
import { setQueryDefaults } from './utils'

/*
 * This logic overrides the default behaviour of "api.event.get"
 * by making it so all "FILE" or "FILE_WITH_OPTIONS" type data points
 * are parsed from the received event document and prefetched as part of fetching the record
 *
 * Additionally, all users referenced in the event document are prefetched.
 *
 * This ensures the full record can be browsed even when the user goes offline
 */
setQueryDefaults(trpcOptionsProxy.event.get, {
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

    const queryOptions = trpcOptionsProxy.event.get.queryOptions(input.input)

    if (typeof queryOptions.queryFn !== 'function') {
      throw new Error('queryFn is not a function')
    }
    /*
     * This is a query directly to the tRPC server
     */
    const response = await queryOptions.queryFn(...params)

    const eventDocument = EventDocument.parse(response)

    await Promise.all([
      cacheFiles(eventDocument),
      cacheUsersFromEventDocument(eventDocument)
    ])
    return eventDocument
  }
})

export function useGetEvent() {
  const trpc = useTRPC()
  return {
    useQuery: (id: string, enabled?: boolean) => {
      const eventConfig = useEventConfigurations()
      // Skip the queryFn defined by tRPC and use our own default defined above
      const { queryFn, ...options } = trpc.event.get.queryOptions(id)

      return useQuery({
        ...options,
        enabled: enabled || true,
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
  }
}

/**
 * When full history of an event is not needed, this hook can be used to get the current state of an event.
 * @returns convenience hooks for getting EventState from EventDocument.
 */
export function useGetEventState() {
  const getEvent = useGetEvent()

  return {
    useQuery: (id: string) => {
      const response = getEvent.useQuery(id)
      const eventState = response.data
        ? getCurrentEventState(response.data)
        : undefined

      return {
        ...response,
        declaration: eventState
      }
    },
    useSuspenseQuery: (id: string): EventIndex => {
      const [eventDocument] = getEvent.useSuspenseQuery(id)

      return getCurrentEventState(eventDocument)
    }
  }
}
