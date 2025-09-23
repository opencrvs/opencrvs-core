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

import { useSelector } from 'react-redux'
import {
  deserializeQuery,
  User,
  WorkqueueConfig
} from '@opencrvs/commons/client'
import { getUserDetails } from '@client/profile/profileSelectors'
import { useCountryConfigWorkqueueConfigurations } from '../features/events/useCountryConfigWorkqueueConfigurations'
import { useEvents } from '../features/events/useEvents/useEvents'
import { queryClient, useTRPC } from '../trpc'
import { useUsers } from './useUsers'

function getDeserializedQuery(
  workqueueConfig: WorkqueueConfig | undefined,
  user: User,
  primaryOfficeId: string | undefined
) {
  if (!workqueueConfig) {
    throw new Error('Workqueue config not found')
  }
  if (!primaryOfficeId) {
    throw new Error("User's primary office id not found")
  }
  return deserializeQuery(workqueueConfig.query, {
    ...user,
    primaryOfficeId
  })
}

export const useWorkqueue = (workqueueSlug: string) => {
  // @TODO: remove `legacyUser` once `getUser` provides primaryOfficeId
  const legacyUser = useSelector(getUserDetails)
  const { getUser } = useUsers()
  const [user] = getUser.useSuspenseQuery(legacyUser?.id ?? '')
  const { useGetEventCountsByWorkqueue } = useEvents()

  const { searchEvent } = useEvents()

  const workqueues = useCountryConfigWorkqueueConfigurations()
  const workqueueConfig = workqueues.find(({ slug }) => slug === workqueueSlug)

  const deserializedQueries = workqueues.map((wq) => ({
    slug: wq.slug,
    query: getDeserializedQuery(wq, user, legacyUser?.primaryOffice.id)
  }))

  return {
    getResult: ({ offset, limit }: { offset: number; limit: number }) => {
      const deserializedQuery = getDeserializedQuery(
        workqueueConfig,
        user,
        legacyUser?.primaryOffice.id
      )
      return {
        useSuspenseQuery: () =>
          searchEvent.useSuspenseQuery(
            {
              query: deserializedQuery,
              offset,
              limit,
              sort: [{ field: 'updatedAt', direction: 'desc' }]
            },
            {
              networkMode: 'offlineFirst',
              refetchInterval: 20000
            }
          ),
        useQuery: () =>
          searchEvent.useQuery(
            {
              query: deserializedQuery,
              offset,
              limit,
              sort: [{ field: 'updatedAt', direction: 'desc' }]
            },
            { refetchInterval: 10000 }
          )
      }
    },
    getCount: {
      useSuspenseQuery: () =>
        useGetEventCountsByWorkqueue().useSuspenseQuery(deserializedQueries),
      useQuery: () =>
        useGetEventCountsByWorkqueue().useQuery(deserializedQueries)
    }
  }
}

export function useWorkqueues() {
  const legacyUser = useSelector(getUserDetails)
  const { getUser } = useUsers()
  const [user] = getUser.useSuspenseQuery(legacyUser?.id ?? '')
  const workqueues = useCountryConfigWorkqueueConfigurations()
  const trpc = useTRPC()

  return {
    prefetch: async () => {
      return Promise.all(
        workqueues.map(async (workqueueConfig) => {
          const deserializedQuery = getDeserializedQuery(
            workqueueConfig,
            user,
            legacyUser?.primaryOffice.id
          )

          const key = trpc.event.search.queryKey({
            query: deserializedQuery,
            limit: 10
          })

          const data = queryClient.getQueryData(key)
          const isFetching =
            queryClient.isFetching({
              queryKey: key
            }) > 0

          if (data || isFetching) {
            return
          }

          return queryClient.prefetchQuery({
            ...trpc.event.search.queryOptions({
              query: deserializedQuery,
              limit: 10
            })
          })
        })
      )
    }
  }
}
