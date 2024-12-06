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

import { storage } from '@client/storage'
import { api, queryClient, utils } from '@client/v2-events/trpc'
import { EventDocument } from '@events/schema'
import { useSuspenseQuery } from '@tanstack/react-query'

export function preloadData() {
  utils.config.get.ensureData()
}

function getCanonicalEventId(
  events: EventDocument[],
  eventIdOrTransactionId: string
) {
  const event = events.find(
    (e) =>
      e.id === eventIdOrTransactionId ||
      e.transactionId === eventIdOrTransactionId
  )

  if (!event) {
    throw new Error(`Event with id ${eventIdOrTransactionId} not found`)
  }

  return event.id
}

/**
 * Wraps a canonical mutation function to handle outdated temporary IDs.
 *
 * When an event is created offline and actions referring to that event
 * are also created offline, there may be cases where a request in the
 * buffer still uses a temporary ID to reference the event. This wrapper
 * ensures that the `eventId` parameter is updated to its canonical value
 * before the mutation function is called.
 *
 * @param {function(params: T): Promise<R>} canonicalMutationFn - The mutation function to wrap.
 * @returns {function(params: T): Promise<R>} - A wrapped mutation function that resolves the canonical `eventId` before invocation.
 */
function wrapMutationFnEventIdResolution<T extends { eventId: string }, R>(
  canonicalMutationFn: (params: T) => Promise<R>
): (params: T) => Promise<R> {
  return async (params: T) => {
    const events = await readEventsFromStorage()
    const modifiedParams: T = {
      ...params,
      eventId: getCanonicalEventId(events, params.eventId)
    }
    return canonicalMutationFn(modifiedParams)
  }
}

utils.event.actions.declare.setMutationDefaults(({ canonicalMutationFn }) => ({
  // This retry ensures on page reload if event have not yet synced,
  // the action will be retried once
  retry: 1,
  retryDelay: 5000,
  mutationFn: wrapMutationFnEventIdResolution(canonicalMutationFn),
  onMutate: async (actionInput) => {
    await queryClient.cancelQueries({ queryKey: ['persisted-events'] })
    const events = await readEventsFromStorage()
    const eventToUpdate = events.find(
      (e) =>
        e.id === actionInput.eventId ||
        // This hook is executed before mutationFn, so we need to check for both ids
        e.transactionId === actionInput.eventId
    )!

    const eventsWithoutUpdated = events.filter(
      (e) => e.id !== actionInput.eventId
    )
    const previousActions = eventToUpdate.actions
    await writeEventsToStorage([...eventsWithoutUpdated, eventToUpdate])
    queryClient.invalidateQueries({ queryKey: ['persisted-events'] })
    return { previousActions, events }
  },
  onSettled: async (response) => {
    /*
     * Updates event in store
     */
    if (response) {
      await queryClient.cancelQueries({ queryKey: ['persisted-events'] })
      const events = await readEventsFromStorage()
      const eventsWithoutNew = events.filter((e) => e.id !== response.id)

      await writeEventsToStorage([...eventsWithoutNew, response])
      return queryClient.invalidateQueries({ queryKey: ['persisted-events'] })
    }
  }
}))

utils.event.create.setMutationDefaults(({ canonicalMutationFn }) => ({
  mutationFn: canonicalMutationFn,
  retry: 0,
  onMutate: async (newEvent) => {
    const optimisticEvent = {
      id: newEvent.transactionId,
      type: newEvent.type,
      transactionId: newEvent.transactionId,
      createdAt: new Date(),
      updatedAt: new Date(),
      actions: []
    }

    queryClient.cancelQueries({ queryKey: ['persisted-events'] })

    // Do this as very first synchronous operation so UI can trust
    // that the event is created when changing view for instance
    queryClient.setQueryData(['persisted-events'], (old: EventDocument[]) => [
      ...old,
      optimisticEvent
    ])
    const events = await readEventsFromStorage()
    await writeEventsToStorage([...events, optimisticEvent])
    return optimisticEvent
  },
  onSettled: async (response) => {
    if (response) {
      await queryClient.cancelQueries({ queryKey: ['persisted-events'] })
      const events = await readEventsFromStorage()
      const eventsWithoutNew = events.filter(
        (e) => e.transactionId !== response.transactionId
      )

      await writeEventsToStorage([...eventsWithoutNew, response])
      queryClient.invalidateQueries({ queryKey: ['persisted-events'] })
    }
  },
  onSuccess: (data) => {
    queryClient.setQueryData(['persisted-events'], (old: EventDocument[]) =>
      old.filter((e) => e.transactionId !== data.transactionId).concat(data)
    )
  }
}))

async function readEventsFromStorage() {
  const data = await storage
    .getItem<EventDocument[]>('events')
    .then((e) => e || [])

  return data
}

function writeEventsToStorage(events: EventDocument[]) {
  return storage.setItem('events', events)
}

export function useEvents() {
  const createEvent = () => {
    return api.event.create.useMutation({})
  }
  const declare = () => {
    return api.event.actions.declare.useMutation({})
  }

  const events = useSuspenseQuery({
    queryKey: ['persisted-events'],
    queryFn: () => {
      return readEventsFromStorage()
    }
  })

  return {
    createEvent,
    useStoredEvents: () =>
      useSuspenseQuery({
        queryKey: ['persisted-events'],
        queryFn: () => {
          return storage.getItem('events').then((e) => (e ? JSON.parse(e) : []))
        }
      }),
    events,
    getEvent: (id: string) => {
      return (
        events.data.find((e) => e.id === id) ||
        events.data.find((e) => e.transactionId === id)
      )
    },
    actions: {
      declare
    }
  }
}
