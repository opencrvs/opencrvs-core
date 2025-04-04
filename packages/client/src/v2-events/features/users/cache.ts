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

import { EventDocument } from '@opencrvs/commons/client'
import { findUserIdsFromDocument } from './utils'
import {
  queryClient,
  trpcClient,
  trpcOptionsProxy
} from '@client/v2-events/trpc'

export async function cacheUsers(eventDocument: EventDocument) {
  const userIds = findUserIdsFromDocument(eventDocument)

  const users = await trpcClient.user.list.query(userIds)

  users.map((user) =>
    queryClient.setQueryData(trpcOptionsProxy.user.get.queryKey(user.id), user)
  )
}
