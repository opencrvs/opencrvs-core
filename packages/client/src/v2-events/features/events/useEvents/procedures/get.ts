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

import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import {
  EventDocument,
  EventIndex,
  getCurrentEventState
} from '@opencrvs/commons/client'
import {
  useEventConfiguration,
  useEventConfigurations
} from '@client/v2-events/features/events/useEventConfiguration'
import { cacheFiles } from '@client/v2-events/features/files/cache'
import { useTRPC, trpcOptionsProxy, queryClient } from '@client/v2-events/trpc'
import { cacheUsersFromEventDocument } from '@client/v2-events/features/users/cache'
import { ROUTES } from '@client/v2-events/routes'
import { updateLocalEventIndex } from '../api'
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

    updateLocalEventIndex(eventDocument.id, eventDocument)

    return eventDocument
  }
})

export function useGetEvent() {
  const trpc = useTRPC()

  /*
   * Purpose of this functions is to be able to check if
   * an event has been downloaded and to get its data
   * from the cache without making a network request.
   */
  const findFromCache = (id: string) => {
    const eventConfig = useEventConfigurations()
    // Skip the queryFn defined by tRPC and use our own default defined above
    const { queryFn, ...options } = trpc.event.get.queryOptions(id)

    return useQuery({
      ...options,
      queryKey: trpc.event.get.queryKey(id),
      meta: {
        eventConfig
      },
      /*
       * We never want to refetch this query automatically
       * because it is the user's explicit (audit logged) action to fetch a record
       */
      enabled: false,
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false
    })
  }

  return {
    findFromCache,
    /*
     * This downloads the event document from the server without caching it
     */
    viewEvent: (id: string) => {
      const eventConfig = useEventConfigurations()
      const options = trpc.event.get.queryOptions(id)

      return [
        useSuspenseQuery({
          // In this case we can use the queryFn as this is a ad-hoc query
          ...options,
          meta: {
            eventConfig
          },
          gcTime: 0,
          /*
           * We never want to refetch this query automatically
           * because it is the user's explicit (audit logged) action to fetch a record
           */
          staleTime: Infinity,
          refetchOnMount: false,
          refetchOnReconnect: false,
          refetchOnWindowFocus: false
        }).data
      ]
    },
    getFromCache: (id: string) => {
      const eventConfig = useEventConfigurations()
      // Skip the queryFn defined by tRPC and use our own default defined above
      const { queryFn, ...queryOptions } = trpc.event.get.queryOptions(id)

      if (!queryClient.getQueryData(trpc.event.get.queryKey(id))) {
        throw new Error(
          `Event with id ${id} not found in cache. Please ensure the event is first assigned and downloaded to the browser.`
        )
      }

      return useSuspenseQuery({
        ...queryOptions,
        queryKey: trpc.event.get.queryKey(id),
        meta: {
          eventConfig
        },
        /*
         * We never want to refetch this query automatically
         * because it is the user's explicit (audit logged) action to fetch a record
         */
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false
      }).data
    }
  }
}
