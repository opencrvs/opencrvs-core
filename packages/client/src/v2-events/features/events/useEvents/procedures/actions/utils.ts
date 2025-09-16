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
import {
  ActionInput,
  ActionStatus,
  ActionType,
  EventDocument,
  UUID
} from '@opencrvs/commons/client'

import {
  findLocalEventConfig,
  setEventData,
  updateLocalEventIndex
} from '@client/v2-events/features/events/useEvents/api'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'
import { createTemporaryId } from '@client/v2-events/utils'

export function updateEventOptimistically<T extends ActionInput>(
  actionType: typeof ActionType.DECLARE
) {
  return (variables: T) => {
    const localEvent = queryClient.getQueryData(
      trpcOptionsProxy.event.get.queryKey(variables.eventId)
    )
    if (!localEvent) {
      return
    }

    const eventConfig = findLocalEventConfig(localEvent.type)
    if (!eventConfig) {
      return
    }

    const optimisticEvent: EventDocument = {
      ...localEvent,
      actions: [
        ...localEvent.actions,
        {
          id: createTemporaryId(),
          type: actionType,
          declaration: variables.declaration || {},
          createdAt: new Date().toISOString(),
          createdByUserType: 'user',
          createdBy: '@todo',
          createdAtLocation: '@todo' as UUID,
          status: ActionStatus.Requested,
          transactionId: variables.transactionId,
          createdByRole: '@todo'
        }
      ]
    }

    updateLocalEventIndex(optimisticEvent.id, optimisticEvent)
  }
}

export function addMarkAsNotDuplicateActionOptimistically<
  T extends ActionInput
>() {
  return (variables: T) => {
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
          type: ActionType.MARK_AS_NOT_DUPLICATE,
          declaration: variables.declaration || {},
          createdAt: new Date().toISOString(),
          createdByUserType: 'user',
          createdBy: '@todo',
          createdAtLocation: '@todo' as UUID,
          status: ActionStatus.Accepted,
          transactionId: variables.transactionId,
          createdByRole: '@todo'
        }
      ]
    }

    setEventData(optimisticEvent.id, optimisticEvent)
  }
}

export function approveCorrectionOptimistically<T extends ActionInput>() {
  return (variables: T) => {
    const localEvent = queryClient.getQueryData(
      trpcOptionsProxy.event.get.queryKey(variables.eventId)
    )

    if (!localEvent) {
      return
    }

    if (!('requestId' in variables)) {
      return
    }

    const optimisticEvent: EventDocument = {
      ...localEvent,
      actions: [
        ...localEvent.actions,
        {
          id: createTemporaryId(),
          type: ActionType.APPROVE_CORRECTION,
          declaration: {},
          createdAt: new Date().toISOString(),
          createdByUserType: 'user',
          createdBy: '@todo',
          createdAtLocation: '@todo' as UUID,
          status: ActionStatus.Accepted,
          transactionId: variables.transactionId,
          createdByRole: '@todo',
          requestId: variables.requestId
        }
      ]
    }

    setEventData(optimisticEvent.id, optimisticEvent)
  }
}

export function correctEventOptimistically<T extends ActionInput>() {
  return (variables: T) => {
    const localEvent = queryClient.getQueryData(
      trpcOptionsProxy.event.get.queryKey(variables.eventId)
    )

    if (!localEvent) {
      return
    }

    const requestId = createTemporaryId()

    const optimisticEvent: EventDocument = {
      ...localEvent,
      actions: [
        ...localEvent.actions,
        {
          id: requestId,
          type: ActionType.REQUEST_CORRECTION,
          declaration: variables.declaration || {},
          createdAt: new Date().toISOString(),
          createdByUserType: 'user',
          createdBy: '@todo',
          createdAtLocation: '@todo' as UUID,
          status: ActionStatus.Accepted,
          transactionId: variables.transactionId,
          createdByRole: '@todo'
        },
        {
          id: createTemporaryId(),
          type: ActionType.APPROVE_CORRECTION,
          declaration: {},
          createdAt: new Date().toISOString(),
          createdByUserType: 'user',
          createdBy: '@todo',
          createdAtLocation: '@todo' as UUID,
          status: ActionStatus.Accepted,
          transactionId: variables.transactionId,
          createdByRole: '@todo',
          requestId
        }
      ]
    }

    setEventData(optimisticEvent.id, optimisticEvent)
  }
}
