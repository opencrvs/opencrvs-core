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
import { TRPCClientError } from '@trpc/client'
import {
  ActionType,
  EventDocument,
  FieldValue,
  getCurrentEventState,
  omitHiddenAnnotationFields,
  omitHiddenPaginatedFields
} from '@opencrvs/commons/client'
import * as customApi from '@client/v2-events/custom-api'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import {
  cleanUpOnUnassign,
  findLocalEventData,
  onAssign,
  updateLocalEvent
} from '@client/v2-events/features/events/useEvents/api'
import { updateEventOptimistically } from '@client/v2-events/features/events/useEvents/procedures/actions/utils'
import {
  createEventActionMutationFn,
  setMutationDefaults,
  waitUntilEventIsCreated
} from '@client/v2-events/features/events/useEvents/procedures/utils'
import {
  AppRouter,
  queryClient,
  trpcOptionsProxy
} from '@client/v2-events/trpc'

setMutationDefaults(trpcOptionsProxy.event.actions.declare.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.declare.request
  ),
  retry: true,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  onMutate: updateEventOptimistically(ActionType.DECLARE),
  meta: {
    actionType: ActionType.DECLARE
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.register.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.register.request
  ),
  retry: true,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  meta: {
    actionType: ActionType.REGISTER
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.notify.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.notify.request
  ),
  retry: true,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  meta: {
    actionType: ActionType.NOTIFY
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.validate.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.validate.request
  ),
  retry: true,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  meta: {
    actionType: ActionType.VALIDATE
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.reject.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.reject.request
  ),
  retry: true,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  meta: {
    actionType: ActionType.REJECT
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.archive.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.archive.request
  ),
  retry: true,
  retryDelay: 10000,
  onSuccess: updateLocalEvent,
  meta: {
    actionType: ActionType.ARCHIVE
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.printCertificate.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.printCertificate.request
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

setMutationDefaults(trpcOptionsProxy.event.actions.assignment.assign, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.assignment.assign
  ),
  retry: (_, error: TRPCClientError<AppRouter>) =>
    error.data?.httpStatus !== 409,
  retryDelay: 10000,
  onSuccess: onAssign,
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
  meta: {
    actionType: ActionType.UNASSIGN
  }
})

export const customMutationKeys = {
  validateOnDeclare: ['validateOnDeclare'],
  registerOnDeclare: ['registerOnDeclare'],
  registerOnValidate: ['registerOnValidate']
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

queryClient.setMutationDefaults(customMutationKeys.registerOnValidate, {
  mutationFn: customApi.registerOnValidate,
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

  type ActionMutationInput = inferInput<P> & { fullEvent?: EventDocument }

  function getMutationPayload(params: ActionMutationInput) {
    const { eventId } = params
    const localEvent = findLocalEventData(eventId)
    const eventConfiguration = eventConfigurations.find(
      (event) => event.id === localEvent?.type
    )

    if (!eventConfiguration) {
      throw new Error('Event configuration not found')
    }

    // Let's find the action configuration. For NOTIFY action, we can use the DECLARE action configuration.
    const actionConfiguration = eventConfiguration.actions.find((action) =>
      actionType === ActionType.NOTIFY
        ? action.type === ActionType.DECLARE
        : action.type === actionType
    )

    const originalDeclaration = params.fullEvent
      ? getCurrentEventState(params.fullEvent).declaration
      : {}

    const annotation = actionConfiguration
      ? omitHiddenAnnotationFields(
          actionConfiguration,
          params.annotation,
          originalDeclaration
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
