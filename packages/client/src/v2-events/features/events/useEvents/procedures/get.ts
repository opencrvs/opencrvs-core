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

import { useEffect } from 'react'
import {
  useQuery,
  useSuspenseQuery,
  UseSuspenseQueryOptions
} from '@tanstack/react-query'
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

async function fetchEventForViewing(id: UUID): Promise<EventDocument> {
  const eventDocument = await trpcClient.event.get.query({
    eventId: id,
    waitFor: false
  })

  await Promise.all([
    cacheFiles(eventDocument),
    cacheUsersFromEventDocument(eventDocument)
  ])

  return eventDocument
}

// Both branches call the same hooks in the same order — cachedAssignedEvent
// can flip mid-session, and branching hooks on it breaks rules-of-hooks.
// Only the queryOptions passed to useSuspenseQuery differ per branch.
function useGetOrDownloadEvent(id: UUID) {
  const trpc = useTRPC()
  const eventConfig = useEventConfigurations()
  const cachedAssignedEvent = queryClient.getQueryData(
    trpc.event.get.queryKey({ eventId: id, waitFor: false })
  )

  const viewEventQueryKey = [['view-event', id]]

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: viewEventQueryKey, exact: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const { queryFn, ...assignedQueryOptions } = trpc.event.get.queryOptions({
    eventId: id,
    waitFor: false
  })

  // The tRPC-derived branch's error type doesn't structurally match a plain
  // `Error`, but both branches resolve to the same `EventDocument` on
  // success, which is all the caller relies on.
  const queryOptions = (
    cachedAssignedEvent
      ? {
          // Assigned & cached: read from cache without network
          ...assignedQueryOptions,
          queryKey: trpc.event.get.queryKey({ eventId: id, waitFor: false }),
          meta: { eventConfig },
          staleTime: Infinity,
          refetchOnMount: false,
          refetchOnReconnect: false,
          refetchOnWindowFocus: false
        }
      : {
          // Not downloaded: always a real network call and a real loading state
          queryKey: viewEventQueryKey,
          queryFn: async () => fetchEventForViewing(id),
          gcTime: 0,
          staleTime: Infinity,
          refetchOnMount: false,
          refetchOnReconnect: false,
          refetchOnWindowFocus: false
        }
  ) as UseSuspenseQueryOptions<EventDocument>

  return useSuspenseQuery(queryOptions).data
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
    const { queryFn, ...options } = trpc.event.get.queryOptions({
      eventId: id,
      waitFor: false
    })

    return useQuery({
      ...options,
      queryKey: trpc.event.get.queryKey({ eventId: id, waitFor: false }),
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
      const { queryFn, ...queryOptions } = trpc.event.get.queryOptions({
        eventId: id,
        waitFor: false
      })
      const downloaded = queryClient.getQueryData(
        trpc.event.get.queryKey({ eventId: id, waitFor: false })
      )

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
        queryKey: trpc.event.get.queryKey({ eventId: id, waitFor: false }),
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
