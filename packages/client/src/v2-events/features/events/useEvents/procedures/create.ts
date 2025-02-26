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
import { v4 as uuid } from 'uuid'
import { CreatedAction, getCurrentEventState } from '@opencrvs/commons/client'
import {
  getLocalEventData,
  invalidateEventsList,
  setEventData,
  setEventListData,
  setMutationDefaults
} from '@client/v2-events/features/events/useEvents/api'
import { queryClient, useTRPC, utils } from '@client/v2-events/trpc'

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

    const localVersion = getLocalEventData(eventId)
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

setMutationDefaults(utils.event.create, {
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
          id: createTemporaryId(),
          createdAt: new Date().toISOString(),
          createdBy: 'offline',
          createdAtLocation: 'TODO',
          draft: false,
          data: {}
        } satisfies CreatedAction
      ]
    }

    setEventData(newEvent.transactionId, optimisticEvent)
    setEventListData((eventIndices) =>
      eventIndices?.concat(getCurrentEventState(optimisticEvent))
    )
    return optimisticEvent
  },
  onSuccess: async (response, _variables, context) => {
    setEventData(response.id, response)
    setEventData(context.transactionId, response)
    await invalidateEventsList()
  }
})

export function useCreateEvent() {
  const trpc = useTRPC()
  const options = trpc.event.create.mutationOptions<{
    transactionId: string
  }>()

  const overrides = queryClient.getMutationDefaults(
    utils.event.create.mutationKey()
  )
  return useMutation({
    ...options,
    ...overrides
  })
}
