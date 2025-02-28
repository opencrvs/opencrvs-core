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
import { isTemporaryId } from '@client/v2-events/utils'
import { queryClient, utils } from '@client/v2-events/trpc'

export function findLocalEventData(eventId: string) {
  return queryClient.getQueryData(utils.event.get.queryKey(eventId)) as
    | EventDocument
    | undefined
}

export function waitUntilEventIsCreated<T extends { eventId: string }, R>(
  canonicalMutationFn: (params: T) => Promise<R>
): (params: T) => Promise<R> {
  return async (params) => {
    const { eventId } = params

    if (!isTemporaryId(eventId)) {
      return canonicalMutationFn({ ...params, eventId: eventId })
    }

    const localVersion = findLocalEventData(eventId)
    if (!localVersion || isTemporaryId(localVersion.id)) {
      throw new Error('Event that has not been stored yet cannot be deleted')
    }

    return canonicalMutationFn({
      ...params,
      eventId: localVersion.id,
      eventType: localVersion.type
    })
  }
}
