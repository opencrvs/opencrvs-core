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

import { useMutation } from '@tanstack/react-query'
import { getMutationKey } from '@trpc/react-query'
import { EventDocument } from '@opencrvs/commons/client'
import { api, utils } from '@client/v2-events/trpc'
import { getCanonicalEventId, getEvents, persistEvents } from './persist'

function waitUntilEventIsCreated<R>(
  canonicalMutationFn: (params: { eventId: string }) => Promise<R>
): (params: { eventId: string }) => Promise<R> {
  return async ({ eventId }) => {
    const events = getEvents()

    const id = getCanonicalEventId(events, eventId)

    if (!id || id === eventId) {
      throw new Error('Event that has not been stored yet cannot be deleted')
    }

    return canonicalMutationFn({ eventId: id })
  }
}

utils.event.delete.setMutationDefaults(({ canonicalMutationFn }) => ({
  retry: true,
  retryDelay: 10000,
  onSuccess: ({ id }) => {
    persistEvents((old: EventDocument[]) => old.filter((e) => e.id !== id))
  },
  /*
   * This ensures that when the application is reloaded with pending mutations in IndexedDB, the
   * temporary event IDs in the requests get properly replaced with canonical IDs.
   * Also check utils.event.create.onSuccess for the same logic but for when even is created.
   */
  mutationFn: waitUntilEventIsCreated(canonicalMutationFn)
}))

export function useDeleteEventMutation() {
  const deleteDefaults = utils.event.delete.getMutationDefaults()
  if (!deleteDefaults?.mutationFn) {
    throw new Error(
      'No mutation fn found for event.delete. This should never happen'
    )
  }
  return useMutation({
    ...deleteDefaults,
    mutationKey: getMutationKey(api.event.delete),
    mutationFn: waitUntilEventIsCreated(deleteDefaults.mutationFn)
  })
}
