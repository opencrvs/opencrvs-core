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

import { hashKey } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { EventDocument } from '@opencrvs/commons/client'
import { api, queryClient, utils } from '@client/v2-events/trpc'
import { useEventAction } from './procedures/action'
import { createEvent } from './procedures/create'
import { useDeleteEventMutation } from './procedures/delete'
import { createObserver, useEventsSuspenseQuery } from './procedures/persist'

const observer = createObserver()

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
})

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

  const storedEvents = useEventsSuspenseQuery()

  return {
    createEvent,
    events: storedEvents,
    getEvent,
    getEventById: api.event.get,
    getEvents: api.events.get,
    getDrafts,
    deleteEvent: useDeleteEventMutation(),
    getOutbox,
    actions: {
      draft: useEventAction(utils.event.actions.draft, api.event.actions.draft),
      notify: useEventAction(
        utils.event.actions.notify,
        api.event.actions.notify
      ),
      declare: useEventAction(
        utils.event.actions.declare,
        api.event.actions.declare
      ),
      register: useEventAction(
        utils.event.actions.register,
        api.event.actions.register
      )
    }
  }
}
