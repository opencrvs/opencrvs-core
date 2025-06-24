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
import type {
  DecorateMutationProcedure,
  inferInput
} from '@trpc/tanstack-react-query'
import {
  ActionType,
  CreatedAction,
  getCurrentEventState,
  ActionStatus,
  getUUID,
  EventInput,
  UUID,
  TokenUserType
} from '@opencrvs/commons/client'

import {
  findLocalEventConfig,
  invalidateEventsList,
  setEventData,
  setEventListData
} from '@client/v2-events/features/events/useEvents/api'
import { queryClient, useTRPC, trpcOptionsProxy } from '@client/v2-events/trpc'

import { createTemporaryId } from '@client/v2-events/utils'
import { setMutationDefaults } from './utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createEventCreationMutation<P extends DecorateMutationProcedure<any>>(
  trpcProcedure: P
) {
  const mutationOptions = {
    ...trpcProcedure.mutationOptions(),
    ...queryClient.getMutationDefaults(trpcProcedure.mutationKey())
  }

  if (!mutationOptions.mutationFn) {
    throw new Error(
      'No mutation fn found for operation. This should never happen'
    )
  }

  const defaultMutationFn = mutationOptions.mutationFn

  return async (params: inferInput<P>) =>
    defaultMutationFn({
      ...params,
      declaration: params.declaration
    })
}

setMutationDefaults(trpcOptionsProxy.event.create, {
  retry: true,
  retryDelay: 3333,
  mutationFn: createEventCreationMutation(trpcOptionsProxy.event.create),
  onMutate: (newEvent) => {
    const optimisticEvent = {
      id: newEvent.transactionId as UUID, // not actually an UUID, but as as it's temporary for the optimistic update, we can satisfy the type this way
      type: newEvent.type,
      trackingId: '', // Tracking ID is generated on the server side, so optimistic event can use an empty string as a placeholder
      transactionId: newEvent.transactionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      actions: [
        {
          type: ActionType.CREATE,
          id: createTemporaryId(),
          createdAt: new Date().toISOString(),
          createdBy: 'offline',
          createdByUserType: TokenUserType.Enum.user,
          createdByRole: 'offline',
          createdAtLocation: '00000000-0000-0000-0000-000000000000' as UUID,
          declaration: {},
          status: ActionStatus.Accepted,
          transactionId: getUUID()
        } satisfies CreatedAction
      ]
    }

    setEventData(newEvent.transactionId, optimisticEvent)
    setEventListData((eventIndices) =>
      eventIndices?.concat(
        getCurrentEventState(
          optimisticEvent,
          findLocalEventConfig(optimisticEvent.type) ?? {}
        )
      )
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
  const options = trpc.event.create.mutationOptions<EventInput>()

  const overrides = queryClient.getMutationDefaults(
    trpcOptionsProxy.event.create.mutationKey()
  )

  return useMutation({
    ...options,
    ...overrides
  })
}
