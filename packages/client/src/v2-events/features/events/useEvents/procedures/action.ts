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

import { Mutation as TanstackMutation } from '@tanstack/query-core'
import { hashKey, useMutation } from '@tanstack/react-query'
import { getMutationKey, getQueryKey } from '@trpc/react-query'
import {
  DraftActionInput,
  EventDocument,
  getCurrentEventState
} from '@opencrvs/commons/client'
import { ActionFormData } from '@opencrvs/commons'
import { api, queryClient, utils } from '@client/v2-events/trpc'

async function updateLocalEvent(updatedEvent: EventDocument) {
  utils.event.get.setData(updatedEvent.id, updatedEvent)
  return utils.events.get.invalidate()
}

function waitUntilEventIsCreated<T extends { eventId: string }, R>(
  canonicalMutationFn: (params: T) => Promise<R>
): (params: T) => Promise<R> {
  return async (params) => {
    const { eventId } = params

    const localVersion = utils.event.get.getData(eventId)

    if (!localVersion || localVersion.id === localVersion.transactionId) {
      console.error(
        'Event that has not been stored yet cannot be actioned upon'
      )
      throw new Error(
        'Event that has not been stored yet cannot be actioned upon'
      )
    }

    return canonicalMutationFn({ ...params, eventId: localVersion.id })
  }
}

type Mutation =
  | typeof api.event.actions.declare
  | typeof api.event.actions.notify
  | typeof api.event.actions.register
  | typeof api.event.actions.validate

type Procedure =
  | typeof utils.event.actions.declare
  | typeof utils.event.actions.notify
  | typeof utils.event.actions.register
  | typeof utils.event.actions.validate

/*
 * This makes sure that if you are offline and do
 * 1. Create record
 * 2. Create draft
 * 3. Declare the record
 * 4. Connect to the internet
 * The draft stage in the middle will be cancelled. This is to prevent race conditions
 * between when the backend receives the draft when it receives the declare action.
 */
function cancelOngoingDraftRequests(eventId: string) {
  const mutationCache = queryClient.getMutationCache()

  const isDraftMutation = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutation: TanstackMutation<unknown, Error, any, unknown>
  ): mutation is TanstackMutation<unknown, Error, DraftActionInput, unknown> =>
    mutation.options.mutationKey
      ? hashKey(mutation.options.mutationKey) ===
        hashKey(getQueryKey(api.event.actions.draft))
      : false

  mutationCache
    .getAll()
    .filter(
      (mutation) =>
        isDraftMutation(mutation) &&
        mutation.state.variables?.eventId === eventId
    )
    .forEach((mutation) => {
      mutationCache.remove(mutation)
    })
}

function updateEventOptimistically<
  T extends { eventId: string; data: ActionFormData }
>(actionType: 'DECLARE') {
  return (variables: T) => {
    cancelOngoingDraftRequests(variables.eventId)

    const localEvent = utils.event.get.getData(variables.eventId)
    if (!localEvent) {
      return
    }
    const optimisticEvent: EventDocument = {
      ...localEvent,
      actions: [
        ...localEvent.actions,
        {
          type: actionType,
          data: variables.data,
          draft: false,
          createdAt: new Date().toISOString(),
          createdBy: '@todo',
          createdAtLocation: '@todo'
        }
      ]
    }

    utils.events.get.setData(undefined, (eventIndices) =>
      eventIndices
        ?.filter((ei) => ei.id !== optimisticEvent.id)
        .concat(getCurrentEventState(optimisticEvent))
    )
  }
}

utils.event.actions.declare.setMutationDefaults(({ canonicalMutationFn }) => ({
  retry: true,
  retryDelay: 10000,
  mutationFn: waitUntilEventIsCreated(canonicalMutationFn),
  onSuccess: updateLocalEvent,
  onMutate: updateEventOptimistically('DECLARE')
}))

utils.event.actions.register.setMutationDefaults(({ canonicalMutationFn }) => ({
  retry: true,
  retryDelay: 10000,
  mutationFn: waitUntilEventIsCreated(canonicalMutationFn),
  onSuccess: updateLocalEvent
}))

utils.event.actions.notify.setMutationDefaults(({ canonicalMutationFn }) => ({
  retry: true,
  retryDelay: 10000,
  mutationFn: waitUntilEventIsCreated(canonicalMutationFn),
  onSuccess: updateLocalEvent
}))

utils.event.actions.validate.setMutationDefaults(({ canonicalMutationFn }) => ({
  retry: true,
  retryDelay: 10000,
  mutationFn: waitUntilEventIsCreated(canonicalMutationFn),
  onSuccess: updateLocalEvent
}))

export function useEventAction<P extends Procedure, M extends Mutation>(
  procedure: P,
  mutation: M
) {
  const mutationDefaults = procedure.getMutationDefaults()

  if (!mutationDefaults?.mutationFn) {
    throw new Error(
      'No mutation fn found for operation. This should never happen'
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMutation<any, any, any, any>({
    ...mutationDefaults,
    mutationKey: getMutationKey(mutation),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: waitUntilEventIsCreated<any, any>(mutationDefaults.mutationFn)
  }) as ReturnType<M['useMutation']>
}
