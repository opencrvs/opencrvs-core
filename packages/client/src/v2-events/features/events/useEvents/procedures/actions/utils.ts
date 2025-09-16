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
  ActionDocument,
  ActionInput,
  ActionStatus,
  ActionType,
  UUID
} from '@opencrvs/commons/client'
import {
  findLocalEventConfig,
  setEventData,
  updateLocalEventIndex
} from '@client/v2-events/features/events/useEvents/api'
import { queryClient, trpcOptionsProxy } from '@client/v2-events/trpc'
import { createTemporaryId } from '@client/v2-events/utils'

type SupportedActionTypes =
  | typeof ActionType.DECLARE
  | typeof ActionType.MARK_AS_DUPLICATE
  | typeof ActionType.MARK_AS_NOT_DUPLICATE
  | typeof ActionType.APPROVE_CORRECTION
  | typeof ActionType.REQUEST_CORRECTION

/**
 * Optimistically update an event by creating a placeholder/temporary action, before the actual mutation completes.
 *
 * @param actionType - The type of action being performed
 * @param status - Optional status override for the action (defaults to ActionStatus.Accepted)
 * @param useUpdateLocalEventIndex - Whether to update the local event index instead of the full event data (defaults to false)
 * @returns A function that performs the optimistic update and returns the created optimistic action
 */
export function updateEventOptimistically<T extends ActionInput>(
  actionType: SupportedActionTypes,
  status: ActionStatus = ActionStatus.Accepted,
  useUpdateLocalEventIndex: boolean = false
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

    // Unfortunately I was not able to get the typing correct without casting as ActionDocument
    // but I think the solution is otherwise neat so let's go with it for now.
    const optimisticAction = {
      ...variables,
      id: createTemporaryId(),
      declaration: variables.declaration || {},
      createdAt: new Date().toISOString(),
      createdByUserType: 'user' as const,
      createdBy: '@todo',
      createdAtLocation: '@todo' as UUID,
      status,
      createdByRole: '@todo',
      type: actionType
    } as ActionDocument

    const optimisticEvent = {
      ...localEvent,
      actions: [...localEvent.actions, optimisticAction]
    }

    if (useUpdateLocalEventIndex) {
      updateLocalEventIndex(optimisticEvent.id, optimisticEvent)
    } else {
      setEventData(optimisticEvent.id, optimisticEvent)
    }

    return optimisticAction
  }
}
