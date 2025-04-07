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

import { EventDocument, EventIndex } from '@opencrvs/commons/client'
import { findUserIdsFromDocument, findUserIdsFromIndex } from './utils'
import {
  queryClient,
  trpcClient,
  trpcOptionsProxy
} from '@client/v2-events/trpc'

export async function cacheUsers(userIds: string[]) {
  const users = await trpcClient.user.list.query(userIds)

  users.map((user) =>
    queryClient.setQueryData(trpcOptionsProxy.user.get.queryKey(user.id), user)
  )
}

export async function cacheUsersFromEventDocument(
  eventDocument: EventDocument
) {
  const userIds = findUserIdsFromDocument(eventDocument)
  await cacheUsers(userIds)
}

export async function cacheUsersFromEventIndex(eventIndex: EventIndex) {
  const userIds = findUserIdsFromIndex(eventIndex)

  const users = await trpcClient.user.list.query(userIds)

  users.map((user) =>
    queryClient.setQueryData(trpcOptionsProxy.user.get.queryKey(user.id), user)
  )
}
