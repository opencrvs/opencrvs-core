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
import { isEmpty } from 'lodash'
import {
  ActionType,
  ActionUpdate,
  EventDocument,
  getCurrentEventState,
  omitHiddenAnnotationFields,
  omitHiddenPaginatedFields,
  deepMerge,
  EventState,
  EventConfig
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

function retryUnlessConflict(
  _failureCount: number,
  error: TRPCClientError<AppRouter>
) {
  if (_failureCount === 10) {
    toast.error(ToastKey.SOMETHING_WENT_WRONG)
  }
  return error.data?.httpStatus !== 409
}

function retryDelay(attemptIndex: number) {
  return Math.max(10000, 1000 * 2 ** attemptIndex)
}

function errorToastOnConflict(error: TRPCClientError<AppRouter>) {
  if (error.data?.httpStatus === 409) {
    toast.error(ToastKey.NOT_ASSIGNED_ERROR)
  }
}

// Merge actionUpdate with the existing declaration to avoid losing dependent fields.
// For example: if the correction payload contains only `informant.name`, but not `informant.relation`,
// running omitHiddenPaginatedFields on the payload alone would remove `informant.name` (since its parent `informant.relation` is missing).
// By merging first, we preserve such dependencies, and then run a diff to keep only the valid correction fields.
function getCleanedDeclarationDiff(
  eventConfiguration: EventConfig,
  originalDeclaration?: EventState,
  declarationDiff?: EventState
): ActionUpdate | undefined {
  if (isEmpty(declarationDiff)) {
    return declarationDiff
  }

  // If there's no original declaration, just clean the update and return it
  if (isEmpty(originalDeclaration)) {
    return omitHiddenPaginatedFields(
      eventConfiguration.declaration,
      declarationDiff
    )
  }

  // Merge original + updates so we get the final event state
  // (Needed because omitHiddenPaginatedFields func requires a full snapshot, not partial)
  const merged = deepMerge(originalDeclaration, declarationDiff)

  // Remove any hidden/paginated fields from the merged declaration
  // (Ensures we only consider fields relevant to the event configuration)
  const cleanedDeclaration = omitHiddenPaginatedFields(
    eventConfiguration.declaration,
    merged
  )

  // From the update, keep only fields that are valid in the cleaned declaration
  // (Prevents applying updates to hidden/invalid fields)
  const cleanedDeclarationDiff: ActionUpdate = Object.fromEntries(
    Object.entries(declarationDiff).filter(([key]) => key in cleanedDeclaration)
  )
  return cleanedDeclarationDiff
}

setMutationDefaults(trpcOptionsProxy.event.actions.declare.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.declare.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: updateLocalEvent,
  onError: errorToastOnConflict,
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
  retryDelay,
  onSuccess: updateLocalEvent,
  onError: errorToastOnConflict,
  meta: {
    actionType: ActionType.REGISTER
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.notify.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.notify.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: updateLocalEvent,
  onError: errorToastOnConflict,
  meta: {
    actionType: ActionType.NOTIFY
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.validate.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.validate.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: updateLocalEvent,
  onError: errorToastOnConflict,
  meta: {
    actionType: ActionType.VALIDATE
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.reject.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.reject.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: updateLocalEvent,
  onError: errorToastOnConflict,
  meta: {
    actionType: ActionType.REJECT
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.archive.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.archive.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: updateLocalEvent,
  onError: errorToastOnConflict,
  meta: {
    actionType: ActionType.ARCHIVE
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.printCertificate.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.printCertificate.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: updateLocalEvent,
  onError: errorToastOnConflict,
  meta: {
    actionType: ActionType.PRINT_CERTIFICATE
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.correction.request.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.correction.request.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: updateLocalEvent,
  onError: errorToastOnConflict,
  meta: {
    actionType: ActionType.REQUEST_CORRECTION
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.correction.approve.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.correction.approve.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: updateLocalEvent,
  onError: errorToastOnConflict,
  meta: {
    actionType: ActionType.APPROVE_CORRECTION
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.correction.reject.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.correction.reject.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: updateLocalEvent,
  onError: errorToastOnConflict,
  meta: {
    actionType: ActionType.REJECT_CORRECTION
  }
})

setMutationDefaults(trpcOptionsProxy.event.actions.assignment.assign, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.assignment.assign
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: onAssign,
  onError: errorToastOnConflict,
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
  retryDelay,
  onSuccess: cleanUpOnUnassign,
  onError: errorToastOnConflict,
  meta: {
    actionType: ActionType.UNASSIGN
  }
})

type CustomMutationKeys = keyof typeof customApi

export const customMutationKeys = {
  validateOnDeclare: [['validateOnDeclare']],
  registerOnDeclare: [['registerOnDeclare']],
  registerOnValidate: [['registerOnValidate']],
  archiveOnDuplicate: [['archiveOnDuplicate']],
  makeCorrectionOnRequest: [['makeCorrectionOnRequest']]
} satisfies Record<CustomMutationKeys, MutationKey>

interface CustomMutationTypes {
  validateOnDeclare: customApi.CustomMutationParams
  registerOnDeclare: customApi.CustomMutationParams
  registerOnValidate: customApi.CustomMutationParams
  archiveOnDuplicate: customApi.ArchiveOnDuplicateParams
  makeCorrectionOnRequest: customApi.CorrectionRequestParams
}

queryClient.setMutationDefaults(customMutationKeys.validateOnDeclare, {
  mutationFn: waitUntilEventIsCreated(customApi.validateOnDeclare),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: updateLocalEvent,
  onError: errorToastOnConflict,
  meta: {
    actionType: ActionType.DECLARE
  }
})

queryClient.setMutationDefaults(customMutationKeys.registerOnDeclare, {
  mutationFn: waitUntilEventIsCreated(customApi.registerOnDeclare),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: updateLocalEvent,
  onError: errorToastOnConflict,
  meta: {
    actionType: ActionType.DECLARE
  }
})

queryClient.setMutationDefaults(customMutationKeys.registerOnValidate, {
  mutationFn: customApi.registerOnValidate,
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: updateLocalEvent,
  onError: errorToastOnConflict,
  meta: {
    actionType: ActionType.REGISTER
  }
})

queryClient.setMutationDefaults(customMutationKeys.archiveOnDuplicate, {
  mutationFn: customApi.archiveOnDuplicate,
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: updateLocalEvent,
  onError: errorToastOnConflict,
  meta: {
    actionType: ActionType.MARK_AS_DUPLICATE
  }
})

queryClient.setMutationDefaults(customMutationKeys.makeCorrectionOnRequest, {
  mutationFn: customApi.makeCorrectionOnRequest,
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: updateLocalEvent,
  onError: errorToastOnConflict,
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
      declaration: getCleanedDeclarationDiff(
        eventConfiguration,
        originalDeclaration,
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

export function useEventCustomAction<T extends CustomMutationKeys>(
  mutationName: T
) {
  const eventConfigurations = useEventConfigurations()
  const mutationKey = customMutationKeys[mutationName]
  const mutation = useMutation({
    mutationKey: mutationKey,
    ...queryClient.getMutationDefaults(mutationKey)
  })

  return {
    mutate: (params: Omit<CustomMutationTypes[T], 'eventConfiguration'>) => {
      const localEvent = findLocalEventDocument(params.eventId)

      const eventConfiguration = eventConfigurations.find(
        (event) => event.id === localEvent?.type
      )

      if (!eventConfiguration) {
        throw new Error('Event configuration not found')
      }

      const originalDeclaration =
        'event' in params
          ? getCurrentEventState(
              /*
               * typescript is somehow unable to infer the type of params.event to
               * be EventDocument
               */
              params.event as EventDocument,
              eventConfiguration
            ).declaration
          : {}

      return mutation.mutate({
        ...params,
        eventConfiguration,
        declaration: getCleanedDeclarationDiff(
          eventConfiguration,
          originalDeclaration,
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
