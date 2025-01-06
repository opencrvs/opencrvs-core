import { QueryObserver, useSuspenseQuery } from '@tanstack/react-query'
import { EventDocument } from '@opencrvs/commons'
import { queryClient } from '@client/v2-events/trpc'
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

export async function removeEventFromStorage(eventID: string) {
  const events = await readEventsFromStorage()
  const newEvents = events.filter((e) => e.id !== eventID)
  return writeEventsToStorage(newEvents)
}

export function persistEvents(
  updater: (events: EventDocument[]) => EventDocument[]
) {
  return queryClient.setQueryData(EVENTS_PERSISTENT_STORE_STORAGE_KEY, updater)
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

createObserver().subscribe((observerEvent) => {
  /*
   * Persist events to browser storage
   */
  if (!observerEvent.data) {
    return
  }
  void writeEventsToStorage(observerEvent.data)
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
