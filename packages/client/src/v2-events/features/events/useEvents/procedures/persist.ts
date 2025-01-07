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

import { hashKey, QueryObserver, useSuspenseQuery } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { EventDocument } from '@opencrvs/commons'
import { api, queryClient } from '@client/v2-events/trpc'
import { storage } from '@client/storage'

/*
 * Local event storage
 */

const EVENTS_PERSISTENT_STORE_STORAGE_KEY = ['persisted-events']

queryClient.setQueryDefaults(EVENTS_PERSISTENT_STORE_STORAGE_KEY, {
  queryFn: readEventsFromStorage
})

async function readEventsFromStorage() {
  const data = await storage
    .getItem<EventDocument[]>('events')
    .then((e) => e || [])

  return data
}

async function writeEventsToStorage(events: EventDocument[]) {
  return storage.setItem('events', events)
}

export async function persistEvents(
  updater: (events: EventDocument[]) => EventDocument[]
) {
  const events = getEvents()
  await writeEventsToStorage(updater(events))
  await invalidateQueries()
}

export function getCanonicalEventId(
  events: EventDocument[],
  eventIdOrTransactionId: string
) {
  return getEvent(events, eventIdOrTransactionId)?.id
}

export function getEvent(
  events: EventDocument[],
  eventIdOrTransactionId: string
) {
  const event = events.find(
    (e) =>
      e.id === eventIdOrTransactionId ||
      e.transactionId === eventIdOrTransactionId
  )

  return event
}

export function getEvents() {
  const events = queryClient.getQueryData<EventDocument[]>(
    EVENTS_PERSISTENT_STORE_STORAGE_KEY
  )
  if (!events) {
    throw new Error(
      'No events found in EVENTS_PERSISTENT_STORE_STORAGE_KEY query. This should never happen'
    )
  }
  return events
}

export function createObserver() {
  return new QueryObserver<EventDocument[]>(queryClient, {
    queryKey: EVENTS_PERSISTENT_STORE_STORAGE_KEY
  })
}

queryClient.getQueryCache().subscribe((event) => {
  if (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    hashKey(event.query.queryKey[0]) === hashKey(getQueryKey(api.event.get)[0])
  ) {
    if (event.query.state.status === 'success') {
      const data: EventDocument = event.query.state.data

      const allEvents = getEvents()

      const existing = allEvents.find((ev) => ev.id === data.id)

      if (!existing) {
        return void persistEvents((events) => {
          return events.concat(data)
        })
      }

      const remoteIsNewer =
        new Date(data.updatedAt) > new Date(existing.updatedAt)

      if (remoteIsNewer) {
        void persistEvents((events) => {
          return events.filter((ev) => ev.id !== data.id).concat(data)
        })
      }
    }
  }
})

export function useEventsSuspenseQuery() {
  return useSuspenseQuery<EventDocument[]>({
    queryKey: EVENTS_PERSISTENT_STORE_STORAGE_KEY
  })
}

export async function invalidateQueries() {
  return queryClient.invalidateQueries({
    queryKey: EVENTS_PERSISTENT_STORE_STORAGE_KEY
  })
}

export async function updateLocalEvent(updatedEvent: EventDocument) {
  return persistEvents((events) => {
    return events.map((event) =>
      event.id === updatedEvent.id ? updatedEvent : event
    )
  })
}
