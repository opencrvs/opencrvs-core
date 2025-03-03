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
import { useMutation } from '@tanstack/react-query'
import {
  DecorateMutationProcedure,
  inferInput,
  inferOutput
} from '@trpc/tanstack-react-query'
import {
  ActionInput,
  ActionType,
  EventDocument,
  getCurrentEventState,
  stripHiddenOrDisabledFields
} from '@opencrvs/commons/client'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import {
  invalidateEventsList,
  setEventData,
  setEventListData,
  findLocalEventData
} from '@client/v2-events/features/events/useEvents/api'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'
import { createTemporaryId } from '@client/v2-events/utils'
import * as customApi from '@client/v2-events/custom-api'
import { setMutationDefaults, waitUntilEventIsCreated } from './utils'

async function updateLocalEvent(updatedEvent: EventDocument) {
  setEventData(updatedEvent.id, updatedEvent)
  return invalidateEventsList()
}

/*
 * This makes sure that if you are offline and do
 * 1. Create record
 * 2. Create draft
 * 3. Declare the record
 * 4. Connect to the internet
 * The draft stage in the middle will be cancelled. This is to prevent race conditions
 * between when the backend receives the draft and when it receives the declare action.
 */
function cancelOngoingDraftRequests({ eventId, draft }: ActionInput) {
  const mutationCache = queryClient.getMutationCache()

  const isDraftMutation = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutation: TanstackMutation<unknown, Error, any, unknown>
  ): mutation is TanstackMutation<unknown, Error, ActionInput, unknown> => {
    const mutationKey = mutation.options.mutationKey
    if (!mutationKey || !mutationKey[0]) {
      return false
    }
    return ['event', 'actions'].every((key) => mutationKey.flat().includes(key))
  }

  const draftMutationsForThisEvent = mutationCache
    .getAll()
    .filter(
      (mutation) =>
        isDraftMutation(mutation) &&
        mutation.state.variables?.eventId === eventId &&
        mutation.state.variables.draft
    )

  if (!draft) {
    draftMutationsForThisEvent.forEach((mutation) => {
      mutationCache.remove(mutation)
    })
  } else {
    // Keep the last draft mutation as it's this current request
    draftMutationsForThisEvent.slice(0, -1).forEach((mutation) => {
      mutationCache.remove(mutation)
    })
  }
}

function updateEventOptimistically<T extends ActionInput>(
  actionType: typeof ActionType.DECLARE
) {
  return (variables: T) => {
    cancelOngoingDraftRequests(variables)

    const localEvent = queryClient.getQueryData(
      trpcOptionsProxy.event.get.queryKey(variables.eventId)
    )
    if (!localEvent) {
      return
    }
    const optimisticEvent: EventDocument = {
      ...localEvent,
      actions: [
        ...localEvent.actions,
        {
          id: createTemporaryId(),
          type: actionType,
          data: variables.data,
          draft: false,
          createdAt: new Date().toISOString(),
          createdBy: '@todo',
          createdAtLocation: '@todo'
        }
      ]
    }

    setEventListData((eventIndices) =>
      eventIndices
        ?.filter((ei) => ei.id !== optimisticEvent.id)
        .concat(getCurrentEventState(optimisticEvent))
    )
  }
}

setMutationDefaults(trpcOptionsProxy.event.actions.declare, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.declare
  ),
  retry: true,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  onMutate: updateEventOptimistically(ActionType.DECLARE),
  meta: {
    actionType: ActionType.DECLARE
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.register, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.register
  ),
  retry: true,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  meta: {
    actionType: ActionType.REGISTER
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.notify, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.notify
  ),
  retry: true,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  meta: {
    actionType: ActionType.NOTIFY
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.validate, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.validate
  ),
  retry: true,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  meta: {
    actionType: ActionType.VALIDATE
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.printCertificate, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.printCertificate
  ),
  retry: true,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  meta: {
    actionType: ActionType.PRINT_CERTIFICATE
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.correction.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.correction.request
  ),
  retry: true,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  meta: {
    actionType: ActionType.REQUEST_CORRECTION
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.correction.approve, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.correction.approve
  ),
  retry: true,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  meta: {
    actionType: ActionType.APPROVE_CORRECTION
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.correction.reject, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.correction.reject
  ),
  retry: true,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  meta: {
    actionType: ActionType.REJECT_CORRECTION
  }
})

export const customMutationKeys = {
  validateOnDeclare: ['validateOnDeclare'],
  registerOnDeclare: ['registerOnDeclare']
} as const

queryClient.setMutationDefaults(customMutationKeys.validateOnDeclare, {
  mutationFn: waitUntilEventIsCreated(customApi.validateOnDeclare),
  retry: true,
  retryDelay: 10000,

  onSuccess: updateLocalEvent
})

queryClient.setMutationDefaults(customMutationKeys.registerOnDeclare, {
  mutationFn: waitUntilEventIsCreated(customApi.registerOnDeclare),
  retry: true,
  retryDelay: 10000,
  onSuccess: updateLocalEvent
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createEventActionMutationFn<P extends DecorateMutationProcedure<any>>(
  trpcProcedure: P
) {
  /*
   * Merge default tRPC mutationOptions with the ones provided above
   */
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

  return waitUntilEventIsCreated<inferInput<P>, inferOutput<P>>(
    async ({ eventType, ...params }) => {
      return defaultMutationFn({
        ...params,
        data: params.data
      })
    }
  )
}

/**
 * A custom hook that wraps a tRPC mutation procedure for event actions.
 *
 * This hook performs two main operations:
 * 1. Ensures the event the action is for is actually created and not just a local copy before the action is sent.
 * 2. Strips away all fields that should not be part of the payload based on the conditions in the form fields.
 *
 * @template P - The type of the tRPC mutation procedure.
 * @param {P} trpcProcedure - The tRPC mutation procedure to be wrapped.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEventAction<P extends DecorateMutationProcedure<any>>(
  trpcProcedure: P
) {
  const eventConfigurations = useEventConfigurations()

  const allOptions = {
    ...trpcProcedure.mutationOptions(),
    ...queryClient.getMutationDefaults(trpcProcedure.mutationKey())
  }

  const { mutationFn, ...mutationOptions } = allOptions

  const actionType = mutationOptions.meta?.actionType as ActionType | undefined

  if (!actionType) {
    throw new Error(
      `No event action type found. This should never happen, ${JSON.stringify(
        mutationOptions
      )}`
    )
  }

  const mutation = useMutation({
    ...mutationOptions
  })

  return {
    mutate: (params: inferInput<P>) => {
      const localEvent = findLocalEventData(params.eventId)

      console.log('localEvent', localEvent)

      const eventConfiguration = eventConfigurations.find(
        (event) => event.id === localEvent?.type
      )

      if (!eventConfiguration) {
        throw new Error('Event configuration not found')
      }

      return mutation.mutate({
        ...params,
        data: stripHiddenOrDisabledFields(
          actionType,
          eventConfiguration,
          params.data
        )
      })
    }
  }
}
