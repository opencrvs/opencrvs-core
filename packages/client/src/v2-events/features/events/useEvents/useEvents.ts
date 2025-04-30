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
import { EventDocument, EventIndex } from '@opencrvs/commons/client'
import { api, queryClient, utils } from '@client/v2-events/trpc'
import { useEventAction } from './procedures/action'
import { createEvent } from './procedures/create'
import { useDeleteEventMutation } from './procedures/delete'

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
  events: EventIndex[],
  mutation: T,
  filter: (
    event: EventIndex,
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
  const eventsList = api.event.list.useQuery().data ?? []

  function getDrafts(): EventDocument[] {
    const queries = queryClient.getQueriesData<EventDocument>({
      queryKey: getQueryKey(api.event.get)
    })

    return queries
      .map((query) => query[1])
      .filter((event): event is EventDocument =>
        Boolean(event && event.actions[event.actions.length - 1].draft)
      )
  }

  function getOutbox() {
    const eventFromDeclareActions = filterOutboxEventsWithMutation(
      eventsList,
      api.event.actions.declare,
      (event, parameters) => {
        return event.id === parameters.eventId && !parameters.draft
      }
    )

    const eventFromRegisterActions = filterOutboxEventsWithMutation(
      eventsList,
      api.event.actions.register,
      (event, parameters) => {
        return event.id === parameters.eventId && !parameters.draft
      }
    )

    return eventFromDeclareActions
      .concat(eventFromDeclareActions)
      .concat(eventFromRegisterActions)
      .filter(
        /* uniqueById */
        (e, i, arr) => arr.findIndex((a) => a.id === e.id) === i
      )
  }

  return {
    createEvent,
    getEvent: api.event.get,
    getEvents: api.event.list,
    deleteEvent: useDeleteEventMutation(),
    getOutbox,
    getDrafts,
    actions: {
      validate: useEventAction(
        utils.event.actions.validate,
        api.event.actions.validate
      ),
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
