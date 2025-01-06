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

import {
  hashKey,
  MutationKey,
  QueryObserver,
  useSuspenseQuery
} from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { EventDocument, CreatedAction } from '@opencrvs/commons/client'
import { api, queryClient, utils } from '@client/v2-events/trpc'
import { storage } from '@client/storage'

/*
 * Local event storage
 */
const EVENTS_PERSISTENT_STORE_STORAGE_KEY = ['persisted-events']

function getCanonicalEventId(
  events: EventDocument[],
  eventIdOrTransactionId: string
) {
  const event = events.find(
    (e) =>
      e.id === eventIdOrTransactionId ||
      e.transactionId === eventIdOrTransactionId
  )

  return event?.id
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
    const events = queryClient.getQueryData<EventDocument[]>(
      EVENTS_PERSISTENT_STORE_STORAGE_KEY
    )

    if (!events) {
      return canonicalMutationFn(params)
    }

    const id = getCanonicalEventId(events, params.eventId)
    if (!id) {
      return canonicalMutationFn(params)
    }

    const modifiedParams: T = {
      ...params,
      eventId: id
    }
    return canonicalMutationFn(modifiedParams)
  }
}

utils.event.actions.declare.setMutationDefaults(({ canonicalMutationFn }) => ({
  retry: true,
  retryDelay: 10000,
  mutationFn: wrapMutationFnEventIdResolution(canonicalMutationFn)
}))

utils.event.actions.draft.setMutationDefaults(({ canonicalMutationFn }) => ({
  retry: true,
  retryDelay: 10000,
  mutationFn: wrapMutationFnEventIdResolution(canonicalMutationFn)
}))

utils.event.actions.register.setMutationDefaults(({ canonicalMutationFn }) => ({
  retry: true,
  retryDelay: 10000,
  mutationFn: wrapMutationFnEventIdResolution(canonicalMutationFn)
}))

utils.event.delete.setMutationDefaults(({ canonicalMutationFn }) => ({
  retry: true,
  retryDelay: 10000,
  onSuccess: ({ id }) => {
    queryClient.setQueryData(
      EVENTS_PERSISTENT_STORE_STORAGE_KEY,
      (old: EventDocument[]) => {
        return old.filter((e) => e.id !== id)
      }
    )
  },
  /*
   * This ensures that when the application is reloaded with pending mutations in IndexedDB, the
   * temporary event IDs in the requests get properly replaced with canonical IDs.
   * Also check utils.event.create.onSuccess for the same logic but for when even is created.
   */
  mutationFn: async (params) => {
    const events = queryClient.getQueryData<EventDocument[]>(
      EVENTS_PERSISTENT_STORE_STORAGE_KEY
    )

    if (!events) {
      return canonicalMutationFn(params)
    }

    const id = getCanonicalEventId(events, params.eventId)
    if (!id) {
      return canonicalMutationFn(params)
    }

    const modifiedParams = {
      ...params,
      eventId: id
    }
    return canonicalMutationFn(modifiedParams)
  }
}))

utils.event.create.setMutationDefaults(({ canonicalMutationFn }) => ({
  mutationFn: canonicalMutationFn,
  retry: true,
  onMutate: (newEvent) => {
    const optimisticEvent = {
      id: newEvent.transactionId,
      type: newEvent.type,
      transactionId: newEvent.transactionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      actions: [
        {
          type: 'CREATE',
          createdAt: new Date().toISOString(),
          createdBy: 'offline',
          createdAtLocation: 'TODO',
          data: {}
        } satisfies CreatedAction
      ]
    }

    // Do this as very first synchronous operation so UI can trust
    // that the event is created when changing view for instance
    queryClient.setQueryData(
      EVENTS_PERSISTENT_STORE_STORAGE_KEY,
      (events: EventDocument[]) => {
        return [...events, optimisticEvent]
      }
    )

    return optimisticEvent
  },
  onSuccess: async (response) => {
    queryClient
      .getMutationCache()
      .getAll()
      .forEach((mutation) => {
        /*
         * Update ongoing mutations with the new event ID so that transaction id is not used for querying
         */
        const hashQueryKey = (
          key: MutationKey | ReturnType<typeof getQueryKey> | undefined
        ) => key?.flat().join('.')

        if (
          hashQueryKey(mutation.options.mutationKey) ===
          hashQueryKey(getQueryKey(api.event.actions.declare))
        ) {
          const variables = mutation.state.variables as Exclude<
            ReturnType<
              typeof api.event.actions.declare.useMutation
            >['variables'],
            undefined
          >

          if (variables.eventId === response.transactionId) {
            variables.eventId = response.id
          }
        }
        if (
          hashQueryKey(mutation.options.mutationKey) ===
          hashQueryKey(getQueryKey(api.event.delete))
        ) {
          const variables = mutation.state.variables as Exclude<
            ReturnType<typeof api.event.delete.useMutation>['variables'],
            undefined
          >

          if (variables.eventId === response.transactionId) {
            variables.eventId = response.id
          }
        }
      })

    await queryClient.invalidateQueries({
      queryKey: EVENTS_PERSISTENT_STORE_STORAGE_KEY
    })

    queryClient.setQueryData(
      EVENTS_PERSISTENT_STORE_STORAGE_KEY,
      (state: EventDocument[]) => {
        return [
          ...state.filter((e) => e.transactionId !== response.transactionId),
          response
        ]
      }
    )

    await queryClient.cancelQueries({
      queryKey: getQueryKey(api.event.get, response.transactionId, 'query')
    })
  }
}))

queryClient.setQueryDefaults(EVENTS_PERSISTENT_STORE_STORAGE_KEY, {
  queryFn: readEventsFromStorage
})

const observer = new QueryObserver<EventDocument[]>(queryClient, {
  queryKey: EVENTS_PERSISTENT_STORE_STORAGE_KEY
})

observer.subscribe((observerEvent) => {
  observerEvent.data?.forEach((event) => {
    queryClient.setQueryData(
      getQueryKey(api.event.get, event.id, 'query'),
      event
    )

    queryClient.setQueryData(
      getQueryKey(api.event.get, event.transactionId, 'query'),
      event
    )
  })

  /*
   * Persist events to browser storage
   */
  if (observerEvent.data) {
    void writeEventsToStorage(observerEvent.data)
  }
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

function getPendingMutations(
  mutationCreator: Parameters<typeof getQueryKey>[0]
) {
  const key = getQueryKey(mutationCreator)
  return queryClient
    .getMutationCache()
    .getAll()
    .filter((mutation) => mutation.state.status !== 'success')
    .filter(
      (mutation) =>
        mutation.options.mutationKey &&
        hashKey(mutation.options.mutationKey) === hashKey(key)
    )
}

function filterOutboxEventsWithMutation<
  T extends
    | typeof api.event.create
    | typeof api.event.actions.declare
    | typeof api.event.actions.register
>(
  events: EventDocument[],
  mutation: T,
  filter: (
    event: EventDocument,
    parameters: Exclude<ReturnType<T['useMutation']>['variables'], undefined>
  ) => boolean
) {
  return getPendingMutations(mutation).flatMap((m) => {
    const variables = m.state.variables as Exclude<
      ReturnType<T['useMutation']>['variables'],
      undefined
    >
    return events.filter((event) => filter(event, variables))
  })
}

export function useEvents() {
  function createEvent() {
    return api.event.create.useMutation({})
  }
  function deleteEvent() {
    return api.event.delete.useMutation({})
  }

  function draft() {
    return api.event.actions.draft.useMutation({})
  }

  function declare() {
    return api.event.actions.declare.useMutation({})
  }

  function register() {
    return api.event.actions.register.useMutation({})
  }

  function getEvent(id: string) {
    return api.event.get.useSuspenseQuery(id)
  }

  function getDrafts() {
    return storedEvents.data.filter(
      (event) => !event.actions.some((a) => a.type === 'DECLARE')
    )
  }

  function getOutbox() {
    const eventFromCreateMutations = filterOutboxEventsWithMutation(
      storedEvents.data,
      api.event.create,
      (event, parameters) => event.transactionId === parameters.transactionId
    )

    const eventFromDeclareActions = filterOutboxEventsWithMutation(
      storedEvents.data,
      api.event.actions.declare,
      (event, parameters) => {
        return (
          event.id === parameters.eventId ||
          event.transactionId === parameters.eventId
        )
      }
    )

    const eventFromRegisterActions = filterOutboxEventsWithMutation(
      storedEvents.data,
      api.event.actions.register,
      (event, parameters) => {
        return (
          event.id === parameters.eventId ||
          event.transactionId === parameters.eventId
        )
      }
    )

    const pendingActions = getPendingMutations(api.event.actions.declare).map(
      (mutation) => {
        const variables = mutation.state.variables as Exclude<
          ReturnType<typeof api.event.actions.declare.useMutation>['variables'],
          undefined
        >
        return {
          eventId: variables.eventId,
          action: {
            type: 'DECLARE' as const,
            createdAt: new Date().toISOString(),
            createdBy: 'offline',
            createdAtLocation: 'TODO',
            data: variables.data
          }
        }
      }
    )

    return eventFromCreateMutations
      .concat(eventFromDeclareActions)
      .concat(eventFromRegisterActions)
      .filter(
        /* uniqueById */
        (e, i, arr) => arr.findIndex((a) => a.id === e.id) === i
      )
      .map((event) => {
        return {
          ...event,
          actions: event.actions.concat(
            pendingActions
              .filter(
                (a) =>
                  a.eventId === event.id || a.eventId === event.transactionId
              )
              .map((a) => a.action)
          )
        }
      })
  }

  const storedEvents = useSuspenseQuery<EventDocument[]>({
    queryKey: EVENTS_PERSISTENT_STORE_STORAGE_KEY
  })

  return {
    createEvent,
    events: storedEvents,
    getEvent,
    getEventById: api.event.get,
    getEvents: api.events.get,
    getDrafts,
    deleteEvent,
    getOutbox,
    actions: {
      draft,
      declare,
      register
    }
  }
}
