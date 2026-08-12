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
import { MutationKey, useMutation } from '@tanstack/react-query'
import {
  ActionType,
  EventDocument,
  EventState,
  getCurrentEventState,
  getEventValidatorContext
} from '@opencrvs/commons/client'
import * as customApi from '@client/v2-events/custom-api'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'
import {
  deleteLocalEvent,
  findLocalEventDocument
} from '@client/v2-events/features/events/useEvents/api'
import { getCleanedDeclarationDiff } from '@client/v2-events/features/events/useEvents/procedures/actions/declarationDiff'
import { updateEventOptimistically } from '@client/v2-events/features/events/useEvents/procedures/actions/utils'
import {
  deleteLocalEventAndToastOnDuplicate,
  errorToastOnConflict,
  retryDelay,
  retryUnlessConflict
} from '@client/v2-events/features/events/useEvents/procedures/actions/mutationHandlers'
import { waitUntilEventIsCreated } from '@client/v2-events/features/events/useEvents/procedures/utils'
import { queryClient } from '@client/v2-events/trpc'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'

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
  editAndRegister: customApi.CustomMutationParams
  editAndDeclare: customApi.CustomMutationParams
  editAndNotify: customApi.CustomMutationParams
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

      // Edit and direct-correction actions need the registered declaration as
      // the original so cleared fields in the diff are emitted as `null`. Use
      // the locally cached full event when `event` is not in params.
      const needsOriginalDeclaration =
        mutationName === 'editAndDeclare' ||
        mutationName === 'editAndRegister' ||
        mutationName === 'editAndNotify' ||
        mutationName === 'makeCorrectionOnRequest'

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
      } else if (needsOriginalDeclaration && localEvent) {
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
          validatorContext: {
            ...validatorContext,
            event:
              localEvent &&
              getEventValidatorContext(localEvent, eventConfiguration)
          }
        })
      })
    }
  }
}
