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
  QueryType,
  User,
  WorkqueueConfig
} from '@opencrvs/commons/client'
import { getUserDetails } from '@client/profile/profileSelectors'
import { useWorkqueueConfigurations } from '../features/events/useWorkqueueConfiguration'
import { useEvents } from '../features/events/useEvents/useEvents'
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
  const { useGetEventCounts } = useEvents()

  const { searchEvent } = useEvents()

  const workqueues = useWorkqueueConfigurations()
  const workqueueConfig = workqueues.find(({ slug }) => slug === workqueueSlug)

  const deSerializedQueries = workqueues.map((wq) => ({
    slug: wq.slug,
    query: getDeserializedQuery(wq, user, legacyUser?.primaryOffice.id)
  }))

  return {
    getResult: () => {
      const deserializedQuery = getDeserializedQuery(
        workqueueConfig,
        user,
        legacyUser?.primaryOffice.id
      )
      return {
        useSuspenseQuery: () =>
          searchEvent.useSuspenseQuery(deserializedQuery, {
            networkMode: 'always'
          }),
        useQuery: () => searchEvent.useQuery(deserializedQuery)
      }
    },
    getCount: {
      useSuspenseQuery: () =>
        useGetEventCounts().useSuspenseQuery(deSerializedQueries),
      useQuery: () => useGetEventCounts().useQuery(deSerializedQueries)
    }
  }
}
