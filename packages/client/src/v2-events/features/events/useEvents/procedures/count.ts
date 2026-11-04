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

import { useSuspenseQuery } from '@tanstack/react-query'

import { WorkqueueCountInput } from '@opencrvs/commons/client'
import { trpcOptionsProxy, queryClient } from '@client/v2-events/trpc'
import { workqueueSearchKey } from './search'
import { setQueryDefaults } from './utils'

/** How often the workqueue counts, and the workqueue on screen, are polled. */
export const WORKQUEUE_POLL_INTERVAL = 20000

/**
 * Query options for the workqueue counts. tRPC's own queryFn is left out, so
 * the default queryFn below serves them.
 */
export function workqueueCountOptions(input: WorkqueueCountInput) {
  const { queryFn: _queryFn, ...options } =
    trpcOptionsProxy.workqueue.count.queryOptions(input)
  return options
}

setQueryDefaults(trpcOptionsProxy.workqueue.count, {
  queryFn: async (...params) => {
    const { queryKey } = params[0]
    const [, { input }] = queryKey

    const { queryFn } = trpcOptionsProxy.workqueue.count.queryOptions(input)
    if (!queryFn) {
      throw new Error('queryFn is not defined for workqueue.count')
    }

    const previousCounts =
      queryClient.getQueryData<Record<string, number>>(queryKey)
    const dataUpdateCountAtRequest = new Map(
      queryClient
        .getQueryCache()
        .findAll({ queryKey: workqueueSearchKey() })
        .map(({ queryHash, state }) => [queryHash, state.dataUpdateCount])
    )
    const response = await queryFn(params[0])

    if (previousCounts) {
      // A queue whose count changed refreshes now rather than on its own poll,
      // unless it received data since the counts were requested (e.g. from a write).
      await Promise.all(
        Object.keys(response)
          .filter((slug) => previousCounts[slug] !== response[slug])
          .map(async (slug) =>
            queryClient.refetchQueries(
              {
                queryKey: workqueueSearchKey(slug),
                type: 'active',
                // dataUpdateCount goes up each time the queue gets new
                // data. If it moved while the counts were in flight, the
                // queue was refetched alongside them (e.g. by a write), so
                // another fetch is redundant.
                predicate: ({ queryHash, state }) =>
                  dataUpdateCountAtRequest.get(queryHash) ===
                  state.dataUpdateCount
              },
              // Join a fetch already in flight (e.g. a write's refetch), don't cancel it.
              { cancelRefetch: false }
            )
          )
      )
    }

    return response
  }
})

export function useGetEventCountsByWorkqueue() {
  return {
    useSuspenseQuery: (queries: WorkqueueCountInput) =>
      useSuspenseQuery({
        ...workqueueCountOptions(queries),
        refetchOnMount: 'always',
        staleTime: 0,
        refetchInterval: WORKQUEUE_POLL_INTERVAL
      }).data
  }
}
