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

import { MutationKey, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  DecorateMutationProcedure,
  inferInput
} from '@trpc/tanstack-react-query'
import { toast } from 'react-hot-toast'
import { TRPCClientError } from '@trpc/client'
import { useSyncExternalStore } from 'react'
import {
  ActionType,
  EventDocument,
  getCurrentEventState,
  omitHiddenAnnotationFields,
  omitHiddenPaginatedFields
} from '@opencrvs/commons/client'
import * as customApi from '@client/v2-events/custom-api'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import {
  cleanUpOnUnassign,
  findLocalEventDocument,
  findLocalEventIndex,
  onAssign,
  updateLocalEvent
} from '@client/v2-events/features/events/useEvents/api'
import { updateEventOptimistically } from '@client/v2-events/features/events/useEvents/procedures/actions/utils'
import {
  createEventActionMutationFn,
  MutationType,
  setMutationDefaults,
  waitUntilEventIsCreated
} from '@client/v2-events/features/events/useEvents/procedures/utils'
import {
  AppRouter,
  queryClient,
  trpcOptionsProxy
} from '@client/v2-events/trpc'
import { ToastKey } from '@client/v2-events/routes/Toaster'
import { useFailedMutationStore } from '../../outbox'

const MAX_RETRY_ATTEMPT = 10

function retryUnlessConflict(
  failureCount: number,
  error: TRPCClientError<AppRouter>
) {
  return error.data?.httpStatus !== 409 && failureCount < MAX_RETRY_ATTEMPT
}

/**
 * Returns an error handler function for a TRPC mutation.
 *
 * - If the error is a conflict (HTTP 409), it shows a specific toast notification.
 * - Otherwise, it logs the failed mutation in the `useFailedMutationStore` for retry
 *   and shows a generic error toast.
 *
 * @param mutationKey - The key identifying the mutation that failed.
 * @returns A function to handle TRPCClientError with associated mutation variables.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleError<T extends Record<string, any>, R>(
  mutationKey: MutationKey
): (error: TRPCClientError<AppRouter>, variables: T) => void {
  return function errorToastOnConflict(error, variables) {
    if (error.data?.httpStatus === 409) {
      toast.error(ToastKey.NOT_ASSIGNED_ERROR)
    } else {
      useFailedMutationStore.getState().addFailedMutation({
        eventId: variables.eventId,
        action: variables.type,
        declaration: variables.declaration,
        transactionId: variables.transactionId,
        annotation: variables.annotation,
        mutationKey,
        variables
      })

      toast.error(ToastKey.SOMETHING_WENT_WRONG)
    }
  }
}

setMutationDefaults(trpcOptionsProxy.event.actions.declare.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.declare.request
  ),
  retry: retryUnlessConflict,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  onError: handleError(
    trpcOptionsProxy.event.actions.declare.request.mutationKey()
  ),
  onMutate: updateEventOptimistically(ActionType.DECLARE),
  meta: {
    actionType: ActionType.DECLARE
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.register.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.register.request
  ),
  retry: retryUnlessConflict,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  onError: handleError(
    trpcOptionsProxy.event.actions.register.request.mutationKey()
  ),
  meta: {
    actionType: ActionType.REGISTER
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.notify.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.notify.request
  ),
  retry: retryUnlessConflict,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  onError: handleError(
    trpcOptionsProxy.event.actions.notify.request.mutationKey()
  ),
  meta: {
    actionType: ActionType.NOTIFY
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.validate.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.validate.request
  ),
  retry: retryUnlessConflict,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  onError: handleError(
    trpcOptionsProxy.event.actions.validate.request.mutationKey()
  ),
  meta: {
    actionType: ActionType.VALIDATE
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.reject.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.reject.request
  ),
  retry: retryUnlessConflict,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  onError: handleError(
    trpcOptionsProxy.event.actions.reject.request.mutationKey()
  ),
  meta: {
    actionType: ActionType.REJECT
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.archive.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.archive.request
  ),
  retry: retryUnlessConflict,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  onError: handleError(
    trpcOptionsProxy.event.actions.archive.request.mutationKey()
  ),
  meta: {
    actionType: ActionType.ARCHIVE
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.printCertificate.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.printCertificate.request
  ),
  retry: retryUnlessConflict,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  onError: handleError(
    trpcOptionsProxy.event.actions.printCertificate.request.mutationKey()
  ),
  meta: {
    actionType: ActionType.PRINT_CERTIFICATE
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.correction.request.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.correction.request.request
  ),
  retry: retryUnlessConflict,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  onError: handleError(
    trpcOptionsProxy.event.actions.correction.request.request.mutationKey()
  ),
  meta: {
    actionType: ActionType.REQUEST_CORRECTION
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.correction.approve.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.correction.approve.request
  ),
  retry: retryUnlessConflict,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  onError: handleError(
    trpcOptionsProxy.event.actions.correction.approve.request.mutationKey()
  ),
  meta: {
    actionType: ActionType.APPROVE_CORRECTION
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.correction.reject.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.correction.reject.request
  ),
  retry: retryUnlessConflict,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  onError: handleError(
    trpcOptionsProxy.event.actions.correction.reject.request.mutationKey()
  ),
  meta: {
    actionType: ActionType.REJECT_CORRECTION
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.assignment.assign, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.assignment.assign
  ),
  retry: retryUnlessConflict,
  retryDelay: 10000,
  onSuccess: onAssign,
  onError: handleError(
    trpcOptionsProxy.event.actions.assignment.assign.mutationKey()
  ),
  meta: {
    actionType: ActionType.ASSIGN
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.assignment.unassign, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.assignment.unassign
  ),
  retry: (_, error: TRPCClientError<AppRouter>) =>
    error.data?.httpStatus !== 403,
  retryDelay: 10000,
  onSuccess: cleanUpOnUnassign,
  onError: handleError(
    trpcOptionsProxy.event.actions.assignment.unassign.mutationKey()
  ),
  meta: {
    actionType: ActionType.UNASSIGN
  }
})

export const customMutationKeys = {
  validateOnDeclare: [['validateOnDeclare']],
  registerOnDeclare: [['registerOnDeclare']],
  registerOnValidate: [['registerOnValidate']],
  makeCorrectionOnRequest: [['makeCorrectionOnRequest']]
} as const

queryClient.setMutationDefaults(customMutationKeys.validateOnDeclare, {
  mutationFn: waitUntilEventIsCreated(customApi.validateOnDeclare),
  retry: retryUnlessConflict,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  onError: handleError(customMutationKeys.validateOnDeclare),
  meta: {
    actionType: ActionType.DECLARE
  }
})

queryClient.setMutationDefaults(customMutationKeys.registerOnDeclare, {
  mutationFn: waitUntilEventIsCreated(customApi.registerOnDeclare),
  retry: retryUnlessConflict,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  onError: handleError(customMutationKeys.registerOnDeclare),
  meta: {
    actionType: ActionType.DECLARE
  }
})

queryClient.setMutationDefaults(customMutationKeys.registerOnValidate, {
  mutationFn: waitUntilEventIsCreated(customApi.registerOnValidate),
  retry: retryUnlessConflict,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  onError: handleError(customMutationKeys.registerOnValidate),
  meta: {
    actionType: ActionType.REGISTER
  }
})

queryClient.setMutationDefaults(customMutationKeys.makeCorrectionOnRequest, {
  mutationFn: waitUntilEventIsCreated(customApi.makeCorrectionOnRequest),
  retry: retryUnlessConflict,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  onError: handleError(customMutationKeys.makeCorrectionOnRequest),
  meta: {
    actionType: ActionType.APPROVE_CORRECTION
  }
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

  type ActionMutationInput = inferInput<P> & { fullEvent?: EventDocument }

  function getMutationPayload(params: ActionMutationInput) {
    const { eventId } = params
    const localEvent =
      /*
       * In most cases an event should be stored in browser as a full event. This applies when:
       * - You are submitting an action flow. Every action flow needs to have downloaded the full event first
       * In other cases, the user might not have the full event downloaded, but only the index. This can happen when:
       * - The user is on event overview page and is assigning / unassigning
       */
      findLocalEventDocument(eventId) || findLocalEventIndex(eventId)

    const eventConfiguration = eventConfigurations.find(
      (event) => event.id === localEvent?.type
    )

    if (!eventConfiguration) {
      throw new Error(
        `Event configuration not found for event: ${localEvent?.type}`
      )
    }

    // Let's find the action configuration. For NOTIFY action, we can use the DECLARE action configuration.
    const actionConfiguration = eventConfiguration.actions.find((action) =>
      actionType === ActionType.NOTIFY
        ? action.type === ActionType.DECLARE
        : action.type === actionType
    )

    const originalDeclaration = params.fullEvent
      ? getCurrentEventState(params.fullEvent, eventConfiguration).declaration
      : {}

    const annotation = actionConfiguration
      ? omitHiddenAnnotationFields(
          actionConfiguration,
          originalDeclaration,
          params.annotation
        )
      : {}

    return {
      ...params,
      declaration: omitHiddenPaginatedFields(
        eventConfiguration.declaration,
        params.declaration
      ),
      annotation
    }
  }

  return {
    mutate: (params: ActionMutationInput) =>
      mutation.mutate(getMutationPayload(params)),
    mutateAsync: async (params: ActionMutationInput) =>
      mutation.mutateAsync(getMutationPayload(params))
  }
}

export function useEventCustomAction(mutationKey: MutationKey) {
  const eventConfigurations = useEventConfigurations()
  const mutation = useMutation({
    mutationKey: mutationKey,
    ...queryClient.getMutationDefaults(mutationKey)
  })

  return {
    mutate: (params: customApi.OnDeclareParams) => {
      const localEvent = findLocalEventDocument(params.eventId)

      const eventConfiguration = eventConfigurations.find(
        (event) => event.id === localEvent?.type
      )

      if (!eventConfiguration) {
        throw new Error('Event configuration not found')
      }

      return mutation.mutate({
        ...params,
        declaration: omitHiddenPaginatedFields(
          eventConfiguration.declaration,
          params.declaration
        )
      })
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useIsMutating<P extends DecorateMutationProcedure<any>>(
  eventId: string,
  procedure: P
) {
  const cache = useQueryClient().getMutationCache()

  return useSyncExternalStore(
    (onStoreChange) => cache.subscribe(onStoreChange),
    () => {
      return (
        cache.findAll({
          mutationKey: procedure.mutationKey(),
          status: 'pending',
          predicate: (mutation) =>
            (mutation as MutationType<P>).state.variables?.eventId === eventId
        }).length > 0
      )
    }
  )
}
