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
 * Creates an optimistic update function for event actions with proper typing.
 *
 * This function provides type-safe handling of requestId based on the action type:
 * - For actions that require requestId (APPROVE_CORRECTION, REJECT_CORRECTION),
 *   the function will automatically include the requestId if present in variables
 * - For other actions, requestId will be ignored
 *
 * @param options - Configuration for the optimistic update
 * @param options.actionType - The type of action being performed
 * @param options.status - Optional status override for the action
 * @param options.declaration - Optional declaration override
 * @param options.useUpdateLocalEventIndex - Whether to update the local event index
 * @returns A function that performs the optimistic update
 */
export function updateEventOptimistically<T extends ActionInput>(options: {
  actionType: SupportedActionTypes
  status?: ActionStatus
  declaration?: Record<string, unknown>
  useUpdateLocalEventIndex?: boolean
}) {
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

    const optimisticAction = {
      ...variables,
      id: createTemporaryId(),
      declaration: variables.declaration || {},
      createdAt: new Date().toISOString(),
      createdByUserType: 'user' as const,
      createdBy: '@todo',
      createdAtLocation: '@todo' as UUID,
      status: options.status || ActionStatus.Requested,
      createdByRole: '@todo',
      type: options.actionType
    } as ActionDocument

    const optimisticEvent = {
      ...localEvent,
      actions: [...localEvent.actions, optimisticAction]
    }

    if (options.useUpdateLocalEventIndex) {
      updateLocalEventIndex(optimisticEvent.id, optimisticEvent)
    } else {
      setEventData(optimisticEvent.id, optimisticEvent)
    }

    return optimisticAction
  }
}
