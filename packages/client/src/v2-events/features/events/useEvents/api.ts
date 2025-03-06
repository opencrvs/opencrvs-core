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

import { v4 as uuid } from 'uuid'
import { EventDocument, EventIndex } from '@opencrvs/commons/client'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'

export function findLocalEventData(eventId: string) {
  return queryClient.getQueryData(
    trpcOptionsProxy.event.get.queryKey(eventId)
  ) as EventDocument | undefined
}

export function setEventData(id: string, data: EventDocument) {
  return queryClient.setQueryData(trpcOptionsProxy.event.get.queryKey(id), data)
}

export function setEventListData(
  updater: (eventIndices: EventIndex[] | undefined) => EventIndex[] | undefined
) {
  return queryClient.setQueryData(
    trpcOptionsProxy.event.list.queryKey(),
    updater
  )
}

export async function invalidateEventsList() {
  return queryClient.invalidateQueries({
    queryKey: trpcOptionsProxy.event.list.queryKey()
  })
}

export async function updateLocalEvent(updatedEvent: EventDocument) {
  setEventData(updatedEvent.id, updatedEvent)
  return invalidateEventsList()
}

export function createTemporaryId() {
  return `tmp-${uuid()}`
}

export function isTemporaryId(id: string) {
  return id.startsWith('tmp-')
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
      // eslint-disable-next-line no-console
      console.debug('Waiting for event to be created', {
        eventId,
        eventType: localVersion?.type,
        params
      })
      throw new Error('Event that has not been stored yet cannot be deleted')
    }

    return canonicalMutationFn({
      ...params,
      eventId: localVersion.id,
      eventType: localVersion.type
    })
  }
}
