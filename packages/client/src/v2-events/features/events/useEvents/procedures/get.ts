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
import { useIntl } from 'react-intl'
import { EventDocument, UUID } from '@opencrvs/commons/client'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import { cacheFiles } from '@client/v2-events/features/files/cache'
import {
  useTRPC,
  trpcOptionsProxy,
  queryClient,
  trpcClient
} from '@client/v2-events/trpc'
import { cacheUsersFromEventDocument } from '@client/v2-events/features/users/cache'
import { throwStructuredError } from '@client/v2-events/routes/TRPCErrorBoundary'
import { ROUTES } from '@client/v2-events/routes'
import { buttonMessages } from '@client/i18n/messages'
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

/**
 * Shared query config for explicitly downloading an event for viewing.
 */
function getViewEventQuery(
  id: UUID,
  eventConfig: ReturnType<typeof useEventConfigurations>
) {
  return {
    queryKey: [['view-event', id]],
    meta: { eventConfig },
    queryFn: async () => {
      const eventDocument = await trpcClient.event.get.query(id)

      await Promise.all([
        cacheFiles(eventDocument),
        cacheUsersFromEventDocument(eventDocument)
      ])

      return eventDocument
    },
    gcTime: 0,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false
  }
}

function useGetOrDownloadEvent(id: UUID) {
  const trpc = useTRPC()
  const eventConfig = useEventConfigurations()
  const cachedAssignedEvent = queryClient.getQueryData(trpc.event.get.queryKey(id))
  const cachedViewEvent = queryClient.getQueryData([['view-event', id]])

  // Already explicitly downloaded
  if (cachedViewEvent) {
    return useSuspenseQuery(getViewEventQuery(id, eventConfig)).data
  }

  // If assigned & cached, read from cache without network
  if (cachedAssignedEvent) {
    const { queryFn, ...queryOptions } = trpc.event.get.queryOptions(id)

    return useSuspenseQuery({
      ...queryOptions,
      queryKey: trpc.event.get.queryKey(id),
      meta: { eventConfig },
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false
    }).data
  }

  // Otherwise: explicit download
  return useSuspenseQuery(getViewEventQuery(id, eventConfig)).data
}

export function useGetEvent() {
  const trpc = useTRPC()

  /**
   * Purpose of this functions is to be able to check if
   * an event has been downloaded and to get its data
   * from the cache without making a network request.
   */
  const useFindEventFromCache = (id: string) => {
    const eventConfig = useEventConfigurations()
    const { queryFn, ...options } = trpc.event.get.queryOptions(id)

    return useQuery({
      ...options,
      queryKey: trpc.event.get.queryKey(id),
      meta: { eventConfig },
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
    useFindEventFromCache,
    useGetOrDownloadEvent,
    getFromCache: (id: UUID) => {
      const intl = useIntl()
      const eventConfig = useEventConfigurations()
      const { queryFn, ...queryOptions } = trpc.event.get.queryOptions(id)
      const downloaded = queryClient.getQueryData(trpc.event.get.queryKey(id))
      const downloadedForViewing = queryClient.getQueryData([['view-event', id]])

      if (downloadedForViewing) {
        return useSuspenseQuery(getViewEventQuery(id, eventConfig)).data
      }

      if (!downloaded) {
        throwStructuredError({
          message: `Event with id ${id} not found in cache. Please ensure the event is first assigned and downloaded to the browser.`,
          redirection: {
            label: intl.formatMessage(buttonMessages.refresh),
            path: ROUTES.V2.EVENTS.EVENT.buildPath({ eventId: id })
          }
        })
      }

      return useSuspenseQuery({
        ...queryOptions,
        queryKey: trpc.event.get.queryKey(id),
        meta: { eventConfig },
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
