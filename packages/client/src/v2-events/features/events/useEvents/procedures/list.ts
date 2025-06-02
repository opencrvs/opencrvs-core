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

import { EventIndex } from '@opencrvs/commons/client'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import { useTRPC, trpcOptionsProxy } from '@client/v2-events/trpc'
import { cacheUsersFromEventIndices } from '@client/v2-events/features/users/cache'
import { setQueryDefaults } from './utils'

/*
 * This logic overrides the default behavior of "api.event.list"
 * by ensuring that all users referenced in the event indices
 * are prefetched as part of fetching the records.
 */
setQueryDefaults(trpcOptionsProxy.event.list, {
  queryFn: async (...params) => {
    const {
      queryKey: [, input]
    } = params[0]

    const queryOptions = trpcOptionsProxy.event.list.queryOptions()

    if (typeof queryOptions.queryFn !== 'function') {
      throw new Error('queryFn is not a function')
    }
    /*
     * This is a query directly to the tRPC server
     */
    const response = await queryOptions.queryFn(...params)

    response.forEach((eventIndex) => {
      EventIndex.parse(eventIndex)
    })
    await cacheUsersFromEventIndices(response)
    return response
  }
})

export function useGetEvents() {
  const trpc = useTRPC()
  return {
    useQuery: () => {
      // Skip the queryFn defined by tRPC and use our own default defined above
      const { queryFn, ...options } = trpc.event.list.queryOptions()

      return useQuery({
        ...options,
        queryKey: trpc.event.list.queryKey()
      })
    },
    useSuspenseQuery: () => {
      const eventConfig = useEventConfigurations()
      // Skip the queryFn defined by tRPC and use our own default defined above
      const { queryFn, ...options } = trpc.event.list.queryOptions()

      return [
        useSuspenseQuery({
          ...options,
          queryKey: trpc.event.list.queryKey(),
          meta: {
            eventConfig
          }
        }).data
      ]
    }
  }
}
