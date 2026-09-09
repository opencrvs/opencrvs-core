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

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  DecorateMutationProcedure,
  inferInput
} from '@trpc/tanstack-react-query'
import { TRPCClientError } from '@trpc/client'
import { useSyncExternalStore } from 'react'
import {
  ActionType,
  ActionStatus,
  EventDocument,
  getActionAnnotationFields,
  getActionFormFields,
  omitHiddenFields,
  deepDropNulls,
  getCurrentEventState,
  getEventValidatorContext
} from '@opencrvs/commons/client'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import {
  cleanUpOnUnassign,
  findLocalEventDocument,
  findLocalEventIndex,
  onAssign,
  deleteLocalEvent,
  onMarkNotDuplicate
} from '@client/v2-events/features/events/useEvents/api'
import { getCleanedDeclarationDiff } from '@client/v2-events/features/events/useEvents/procedures/actions/declarationDiff'
import { updateEventOptimistically } from '@client/v2-events/features/events/useEvents/procedures/actions/utils'
import {
  createEventActionMutationFn,
  MutationType,
  setMutationDefaults
} from '@client/v2-events/features/events/useEvents/procedures/utils'
import {
  AppRouter,
  queryClient,
  trpcOptionsProxy
} from '@client/v2-events/trpc'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'

import {
  deleteLocalEventAndToastOnDuplicate,
  errorToastOnConflict,
  retryDelay,
  retryUnlessConflict
} from '@client/v2-events/features/events/useEvents/procedures/actions/mutationHandlers'

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

setMutationDefaults(trpcOptionsProxy.event.actions.unarchive.request, {
  mutationFn: createEventActionMutationFn(
    trpcOptionsProxy.event.actions.unarchive.request
  ),
  retry: retryUnlessConflict,
  retryDelay,
  onSuccess: deleteLocalEvent,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.UNARCHIVE }
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
  onSuccess: onMarkNotDuplicate,
  onError: errorToastOnConflict,
  meta: { actionType: ActionType.MARK_AS_NOT_DUPLICATE }
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

    const localFullEvent =
      fullEvent ??
      (findLocalEventDocument(eventId) as EventDocument | undefined)

    const originalDeclaration = localFullEvent
      ? getCurrentEventState(localFullEvent, eventConfiguration).declaration
      : {}

    const annotationFields = [
      ...(actionConfiguration
        ? getActionAnnotationFields(actionConfiguration)
        : []),
      // NOTIFY dialog fields come from the NOTIFY config itself; the DECLARE
      // fallback above only covers review fields.
      ...(actionType === ActionType.NOTIFY
        ? getActionFormFields(eventConfiguration, ActionType.NOTIFY)
        : [])
    ]

    // Action types with no config entry at all (ASSIGN, UNASSIGN, duplicate
    // and correction actions, ...) get their annotation cleared, as before.
    // Types with a config entry keep pass-through semantics even with zero
    // configured fields — EDIT's annotation carries review-page values.
    const annotation =
      actionConfiguration || annotationFields.length > 0
        ? deepDropNulls(
            omitHiddenFields(annotationFields, restParams.annotation ?? {}, {
              baseFormState: originalDeclaration
            })
          )
        : {}

    const localEventDocument = findLocalEventDocument(eventId)

    return {
      ...restParams,
      eventId,
      declaration: getCleanedDeclarationDiff({
        eventConfiguration,
        originalDeclaration,
        declarationDiff: params.declaration,
        validatorContext: {
          ...validatorContext,
          event:
            localEventDocument &&
            getEventValidatorContext(localEventDocument, eventConfiguration)
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
