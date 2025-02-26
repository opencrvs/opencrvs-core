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
  EventConfig,
  EventDocument,
  getEventConfiguration
} from '@opencrvs/commons/client'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import { cacheFiles } from '@client/v2-events/features/files/cache'
import { useTRPC, utils } from '@client/v2-events/trpc'
import { setQueryDefaults } from '@client/v2-events/features/events/useEvents/api'

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

export function useGetEvent() {
  const trpc = useTRPC()
  return {
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
  }
}
