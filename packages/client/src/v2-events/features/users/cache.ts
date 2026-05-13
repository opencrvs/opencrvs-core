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

import { EventDocument, UserOrSystemSummary } from '@opencrvs/commons/client'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'
import { findUserIdsFromDocument } from './utils'

async function cacheUsers(userIds: string[]) {
  // Collect all user IDs already present across any existing user.list cache entry.
  // getQueriesData with the base (no-arg) query key matches every user.list query
  // regardless of which specific IDs it was called with.
  const cachedUserIds = new Set<string>(
    queryClient
      .getQueriesData<UserOrSystemSummary[]>({
        queryKey: trpcOptionsProxy.user.list.queryKey()
      })
      .flatMap(([, data]) => data ?? [])
      .map((user) => user.id)
  )

  // Only request IDs we have not seen before.
  const uncachedIds = userIds.filter((id) => !cachedUserIds.has(id))

  if (uncachedIds.length === 0) {
    return
  }

  const { queryFn, ...options } =
    trpcOptionsProxy.user.list.queryOptions(uncachedIds)

  await queryClient.fetchQuery(options)
}

export async function cacheUsersFromEventDocument(
  eventDocument: EventDocument
) {
  const userIds = findUserIdsFromDocument(eventDocument)
  await cacheUsers(userIds)
}
