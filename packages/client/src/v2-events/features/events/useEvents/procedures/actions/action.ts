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

/* eslint-disable max-lines  */
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
  ActionStatus,
  ActionUpdate,
  EventDocument,
  omitHiddenAnnotationFields,
  omitHiddenPaginatedFields,
  deepDropNulls,
  deepMerge,
  EventState,
  EventConfig,
  getCurrentEventState,
  ValidatorContext,
  isPotentialDuplicate
} from '@opencrvs/commons/client'
import * as customApi from '@client/v2-events/custom-api'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import {
  cleanUpOnUnassign,
  findLocalEventDocument,
  findLocalEventIndex,
  onAssign,
  deleteLocalEvent,
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
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'

import { showToast } from '../../../useToastAndRedirect'

function showToastOnDuplicateDetected(event: EventDocument) {
  showToast({
    message: {
      defaultMessage:
        '{trackingId} is a potential duplicate. Record is ready for review.',
      id: 'event.declaration.potentialDuplicateDetected',
      description:
        'Notification for potential duplicate declaration. Shown when a potential duplicate is detected after declaring an event.'
    },
    toastType: 'error',
    toastId: `duplicate-detected-${event.trackingId}`,
    messageOpts: { trackingId: event.trackingId }
  })
}

function deleteLocalEventAndToastOnDuplicate(event: EventDocument) {
  void deleteLocalEvent(event)

  if (isPotentialDuplicate(event.actions)) {
    showToastOnDuplicateDetected(event)
  }
}

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
/**
 * Structurally empty: `undefined`/`null`/`''`, or an array/object whose every
 * leaf is empty. Complex fields (NAME, ADDRESS) clear to nested objects of empty
 * strings (e.g. `{ firstname: '', surname: '' }`), which a shallow truthiness
 * check would wrongly treat as filled. `0` and `false` are real values and are
 * not considered empty.
 */
export function isDeeplyEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === '') {
    return true
  }
  if (Array.isArray(value)) {
    return value.every(isDeeplyEmpty)
  }
  if (typeof value === 'object') {
    return Object.values(value).every(isDeeplyEmpty)
  }
  return false
}

export function getCleanedDeclarationDiff({
  eventConfiguration,
  originalDeclaration,
  declarationDiff,
  validatorContext,
  treatMissingAsCleared = false
}: {
  eventConfiguration: EventConfig
  originalDeclaration?: EventState
  declarationDiff?: EventState
  validatorContext: ValidatorContext
  /**
   * When true (full-form actions such as edits), a field that was non-empty in
   * the original declaration but is empty/missing in the submitted form was
   * cleared by the user and is emitted as `null` so the aggregated declaration
   * drops it. Must stay false for partial payloads (e.g. corrections) where a
   * missing field simply isn't part of the payload and must not be cleared.
   */
  treatMissingAsCleared?: boolean
}): ActionUpdate | undefined {
  if (isEmpty(declarationDiff)) {
    return declarationDiff
  }

  // If there's no original declaration, just clean the update and return it
  if (isEmpty(originalDeclaration)) {
    return omitHiddenPaginatedFields(
      eventConfiguration.declaration,
      declarationDiff,
      validatorContext,
      true
    )
  }

  // Merge original + updates so we get the final event state
  // (Needed because omitHiddenPaginatedFields func requires a full snapshot, not partial)
  const merged = deepMerge(originalDeclaration, declarationDiff)

  // Remove any hidden/paginated fields from the merged declaration
  // But retain hidden fields with empty values indicating they should be removed.
  // Because hidden fields with values in current event state causes confusion and bug in search endpoint
  // (Ensures we only consider fields relevant to the event configuration)
  const cleanedDeclarationWithHiddenFieldsWithNullValues =
    omitHiddenPaginatedFields(
      eventConfiguration.declaration,
      merged,
      validatorContext,
      true
    )

  // From the update, keep only fields that are valid in the cleaned declaration
  // (Prevents applying updates to hidden/invalid fields)
  const cleanedDiff: ActionUpdate = Object.fromEntries(
    Object.entries(declarationDiff).filter(
      ([key]) => key in cleanedDeclarationWithHiddenFieldsWithNullValues
    )
  )

  // For full-form actions, a field that previously held a value but is now empty
  // or missing was cleared by the user. Emit an explicit `null` so aggregating
  // the action declarations overwrites the stale value (a missing/`undefined`
  // key would otherwise be ignored by the deep merge and keep the old value).
  if (treatMissingAsCleared && originalDeclaration) {
    for (const key of Object.keys(originalDeclaration)) {
      if (!(key in cleanedDeclarationWithHiddenFieldsWithNullValues)) {
        continue
      }
      if (isDeeplyEmpty(originalDeclaration[key])) {
        continue
      }
      const submittedValue =
        key in declarationDiff ? declarationDiff[key] : undefined
      if (isDeeplyEmpty(submittedValue)) {
        cleanedDiff[key] = null
      }
    }
  }

  return cleanedDiff
}

setMutationDefaults(trpcOptionsProxy.event.actions.custom.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.custom.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: deleteLocalEvent,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.CUSTOM }
})

setMutationDefaults(trpcOptionsProxy.event.actions.declare.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.declare.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: deleteLocalEventAndToastOnDuplicate,
  onError: errorToastOnConflict,
  onMutate: updateEventOptimistically(
    ActionType.DECLARE,
    ActionStatus.Accepted,
    true
  ),
  meta: { actionType: ActionType.DECLARE }
})

setMutationDefaults(trpcOptionsProxy.event.actions.edit.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.edit.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: deleteLocalEvent,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.EDIT }
})

setMutationDefaults(trpcOptionsProxy.event.actions.register.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.register.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: deleteLocalEventAndToastOnDuplicate,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.REGISTER }
})

setMutationDefaults(trpcOptionsProxy.event.actions.notify.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.notify.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: deleteLocalEvent,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.NOTIFY }
})

setMutationDefaults(trpcOptionsProxy.event.actions.reject.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.reject.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: deleteLocalEvent,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.REJECT }
})

setMutationDefaults(trpcOptionsProxy.event.actions.archive.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.archive.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: deleteLocalEvent,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.ARCHIVE }
})

setMutationDefaults(trpcOptionsProxy.event.actions.printCertificate.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.printCertificate.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  // We can't delete the local event immediately
  // because we're still on the certificate review page for a short time.
  // It will be deleted when unassigned.
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.PRINT_CERTIFICATE }
})

setMutationDefaults(trpcOptionsProxy.event.actions.correction.request.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.correction.request.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: deleteLocalEvent,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.REQUEST_CORRECTION }
})

setMutationDefaults(trpcOptionsProxy.event.actions.correction.approve.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.correction.approve.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: deleteLocalEvent,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.APPROVE_CORRECTION },
  onMutate: updateEventOptimistically(ActionType.APPROVE_CORRECTION)
})

setMutationDefaults(trpcOptionsProxy.event.actions.correction.reject.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.correction.reject.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: deleteLocalEvent,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.REJECT_CORRECTION }
})

setMutationDefaults(trpcOptionsProxy.event.actions.assignment.assign, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.assignment.assign
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: onAssign,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.ASSIGN }
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
  meta: { actionType: ActionType.UNASSIGN }
})

setMutationDefaults(trpcOptionsProxy.event.actions.duplicate.markAsDuplicate, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.duplicate.markAsDuplicate
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: deleteLocalEvent,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.MARK_AS_DUPLICATE }
})

setMutationDefaults(trpcOptionsProxy.event.actions.duplicate.markNotDuplicate, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.duplicate.markNotDuplicate
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onMutate: updateEventOptimistically(ActionType.MARK_AS_NOT_DUPLICATE),
  onSuccess: updateLocalEvent,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.MARK_AS_NOT_DUPLICATE }
})

type CustomMutationKeys = keyof typeof customApi

const customMutationKeys = {
  registerOnDeclare: [['registerOnDeclare']],
  editAndRegister: [['editAndRegister']],
  editAndDeclare: [['editAndDeclare']],
  editAndNotify: [['editAndNotify']],
  archiveOnDuplicate: [['archiveOnDuplicate']],
  makeCorrectionOnRequest: [['makeCorrectionOnRequest']]
} satisfies Record<CustomMutationKeys, MutationKey>

interface CustomMutationTypes {
  registerOnDeclare: customApi.CustomMutationParams
  editAndRegister: customApi.EditRequestParams
  editAndDeclare: customApi.EditRequestParams
  editAndNotify: customApi.EditRequestParams
  archiveOnDuplicate: customApi.ArchiveOnDuplicateParams
  makeCorrectionOnRequest: customApi.CorrectionRequestParams
}

queryClient.setMutationDefaults(customMutationKeys.registerOnDeclare, {
  mutationFn: waitUntilEventIsCreated(customApi.registerOnDeclare),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: deleteLocalEventAndToastOnDuplicate,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.DECLARE }
})

queryClient.setMutationDefaults(customMutationKeys.editAndRegister, {
  mutationFn: customApi.editAndRegister,
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: deleteLocalEventAndToastOnDuplicate,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.REGISTER }
})

queryClient.setMutationDefaults(customMutationKeys.editAndDeclare, {
  mutationFn: customApi.editAndDeclare,
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: deleteLocalEventAndToastOnDuplicate,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.DECLARE }
})

queryClient.setMutationDefaults(customMutationKeys.editAndNotify, {
  mutationFn: customApi.editAndNotify,
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: deleteLocalEvent,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.DECLARE }
})

queryClient.setMutationDefaults(customMutationKeys.archiveOnDuplicate, {
  mutationFn: customApi.archiveOnDuplicate,
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: deleteLocalEvent,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.MARK_AS_DUPLICATE }
})

queryClient.setMutationDefaults(customMutationKeys.makeCorrectionOnRequest, {
  mutationFn: customApi.makeCorrectionOnRequest,
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: deleteLocalEvent,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.APPROVE_CORRECTION },
  onMutate: (variables) => {
    // Since the 'makeCorrectionOnRequest' requires two actions (REQUEST_CORRECTION and APPROVE_CORRECTION),
    // we need to update the event optimistically with both actions.
    const optimisticAction = updateEventOptimistically(
      ActionType.REQUEST_CORRECTION
    )(variables)

    if (!optimisticAction) {
      return
    }

    // For the APPROVE_CORRECTION action, we need to pass the id of the REQUEST_CORRECTION action as 'requestId', so that the actions are properly matched.
    updateEventOptimistically(ActionType.APPROVE_CORRECTION)({
      ...variables,
      requestId: optimisticAction.id
    })
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

  const validatorContext = useValidatorContext()

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
    const { eventId, fullEvent, event, context, ...restParams } = params
    const localEvent =
      /*
       * In most cases an event should be stored in browser as a full event. This applies when:
       * - You are submitting an action flow. Every action flow needs to have downloaded the full event first
       * In other cases, the user might not have the full event downloaded, but only the index. This can happen when:
       * - The user is on event overview page and is assigning / unassigning
       */
      findLocalEventDocument(eventId) || findLocalEventIndex(eventId)

    const eventConfiguration = eventConfigurations.find(
      (e) => e.id === localEvent?.type
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

    const originalDeclaration = fullEvent
      ? getCurrentEventState(fullEvent, eventConfiguration).declaration
      : {}

    const annotation = actionConfiguration
      ? deepDropNulls(
          omitHiddenAnnotationFields(
            actionConfiguration,
            originalDeclaration,
            restParams.annotation,
            {}
          )
        )
      : {}

    return {
      ...restParams,
      eventId,
      declaration: getCleanedDeclarationDiff({
        eventConfiguration,
        originalDeclaration,
        declarationDiff: params.declaration,
        validatorContext: {
          ...validatorContext,
          event: findLocalEventDocument(eventId)
        }
      }),
      annotation
    }
  }

  return {
    mutate: (
      params: ActionMutationInput,
      options?: Parameters<typeof useMutation>[0]
    ) => mutation.mutate(getMutationPayload(params), options),

    mutateAsync: async (
      params: ActionMutationInput,
      options?: Parameters<typeof useMutation>[0]
    ) => mutation.mutateAsync(getMutationPayload(params), options),
    isPending: mutation.isPending
  }
}

export function useEventCustomAction<T extends CustomMutationKeys>(
  mutationName: T
) {
  const eventConfigurations = useEventConfigurations()

  const validatorContext = useValidatorContext()
  const mutationKey = customMutationKeys[mutationName]
  const mutation = useMutation({
    mutationKey,
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

      // Edit actions (editAndDeclare/editAndRegister/editAndNotify) submit the
      // full edited form but do not carry `event` in their params. Use the
      // locally cached full event as the original so getCleanedDeclarationDiff
      // can detect fields the user cleared. Other custom actions (corrections,
      // archive) submit partial payloads and must not clear missing fields.
      const isEditAction =
        mutationName === 'editAndDeclare' ||
        mutationName === 'editAndRegister' ||
        mutationName === 'editAndNotify'

      let originalDeclaration: EventState = {}
      if ('event' in params) {
        originalDeclaration = getCurrentEventState(
          /*
           * typescript is somehow unable to infer the type of params.event to
           * be EventDocument
           */
          params.event as EventDocument,
          eventConfiguration
        ).declaration
      } else if (isEditAction && localEvent) {
        originalDeclaration = getCurrentEventState(
          localEvent,
          eventConfiguration
        ).declaration
      }

      return mutation.mutate({
        ...params,
        eventConfiguration,
        declaration: getCleanedDeclarationDiff({
          eventConfiguration,
          originalDeclaration,
          declarationDiff: params.declaration,
          validatorContext: { ...validatorContext, event: localEvent },
          treatMissingAsCleared: isEditAction
        })
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
