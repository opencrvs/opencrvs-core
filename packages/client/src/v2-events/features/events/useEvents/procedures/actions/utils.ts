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
  EventDocument,
  getCurrentEventState,
  UUID
} from '@opencrvs/commons/client'

import {
  findLocalEventConfig,
  setEventListData
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
          /*
           * These need to be casted or otherwise branded
           * types like FullDocumentPath causes an error here.
           * This is because we are effectively trying to force an input type to an output type
           */
          declaration: (variables.declaration ||
            {}) as ActionDocument['declaration'],
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

    setEventListData((eventIndices) =>
      eventIndices
        ?.filter((ei) => ei.id !== optimisticEvent.id)
        .concat(getCurrentEventState(optimisticEvent, eventConfig))
    )
  }
}
