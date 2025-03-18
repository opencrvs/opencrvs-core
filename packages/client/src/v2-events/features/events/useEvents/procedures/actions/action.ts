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

import { MutationObserverOptions, useMutation } from '@tanstack/react-query'
import {
  DecorateMutationProcedure,
  inferInput
} from '@trpc/tanstack-react-query'
import { TRPCClientErrorLike } from '@trpc/client'
import {
  ActionType,
  EventDocument,
  getActiveActionFields,
  stripHiddenFields
} from '@opencrvs/commons/client'
import * as customApi from '@client/v2-events/custom-api'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import {
  findLocalEventData,
  updateLocalEvent
} from '@client/v2-events/features/events/useEvents/api'
import { updateEventOptimistically } from '@client/v2-events/features/events/useEvents/procedures/actions/utils'
import {
  createEventActionMutationFn,
  setMutationDefaults,
  waitUntilEventIsCreated
} from '@client/v2-events/features/events/useEvents/procedures/utils'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'

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

setMutationDefaults(trpcOptionsProxy.event.actions.reject, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.reject
  ),
  retry: true,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  meta: {
    actionType: ActionType.REJECT
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.archive, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.archive
  ),
  retry: true,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  meta: {
    actionType: ActionType.ARCHIVED
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.printCertificate, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.printCertificate
  ),
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

  // mutationFn will be removed at this stage to ensure it has been specified in a serializable manner under /procedures. This ensures early error detection
  // without explicitly testing offline functionality.
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
    mutate: (
      params: inferInput<P>,
      options?: {
        onSuccess?: (updatedDocument: EventDocument) => void
        onError?: (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          error: TRPCClientErrorLike<any>,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          variables: any,
          context: unknown
        ) => void
        onSettled?: (
          updatedDocument: EventDocument,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          error: TRPCClientErrorLike<any>,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          variables: any,
          context: unknown
        ) => void
      }
    ) => {
      const localEvent = findLocalEventData(params.eventId)

      const eventConfiguration = eventConfigurations.find(
        (event) => event.id === localEvent?.type
      )

      if (!eventConfiguration) {
        throw new Error('Event configuration not found')
      }
      const fields = getActiveActionFields(eventConfiguration, actionType)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const overridenOptions: MutationObserverOptions<any, any, any, any> = {
        ...allOptions,
        onSuccess: async (data, variables, context) => {
          await allOptions.onSuccess?.(data, variables, context)
          options?.onSuccess?.(data)
        },
        onError: async (error, variables, context) => {
          await allOptions.onError?.(error, variables, context)
          options?.onError?.(error, variables, context)
        },
        onSettled: async (data, error, variables, context) => {
          await allOptions.onSettled?.(data, error, variables, context)
          options?.onSettled?.(data, error, variables, context)
        }
      }

      if (actionType === ActionType.NOTIFY) {
        /**
         * Because NOTIFY action is just an incomplete DECLARE action,
         * notifyFields are decided by DECLARE action
         */
        const notifyFields = getActiveActionFields(
          eventConfiguration,
          ActionType.DECLARE
        )

        return mutation.mutate(
          {
            ...params,
            data: stripHiddenFields(notifyFields, params.data)
          },
          overridenOptions
        )
      }

      return mutation.mutate(
        {
          ...params,
          data: stripHiddenFields(fields, params.data)
        },
        overridenOptions
      )
    }
  }
}

export function useEventCustomAction(mutationKey: string[]) {
  const eventConfigurations = useEventConfigurations()
  const mutation = useMutation(queryClient.getMutationDefaults(mutationKey))

  return {
    mutate: (params: customApi.OnDeclareParams) => {
      const localEvent = findLocalEventData(params.eventId)

      const eventConfiguration = eventConfigurations.find(
        (event) => event.id === localEvent?.type
      )

      if (!eventConfiguration) {
        throw new Error('Event configuration not found')
      }

      /**
       * @TODO: In the future all of these forms should be the same 'primary' declare form.
       * When that is done, we can shouldn't need the action type explicitly here.
       */
      const fields = getActiveActionFields(
        eventConfiguration,
        ActionType.DECLARE
      )

      return mutation.mutate({
        ...params,
        data: stripHiddenFields(fields, params.data)
      })
    }
  }
}
