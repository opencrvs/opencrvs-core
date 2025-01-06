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

import { getQueryKey } from '@trpc/react-query'
import { CreatedAction, EventDocument } from '@opencrvs/commons/client'
import { api, queryClient, utils } from '@client/v2-events/trpc'
import { invalidateQueries, persistEvents } from './persist'

utils.event.create.setMutationDefaults(({ canonicalMutationFn }) => ({
  mutationFn: canonicalMutationFn,
  retry: true,
  onMutate: (newEvent) => {
    const optimisticEvent = {
      id: newEvent.transactionId,
      type: newEvent.type,
      transactionId: newEvent.transactionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      actions: [
        {
          type: 'CREATE',
          createdAt: new Date().toISOString(),
          createdBy: 'offline',
          createdAtLocation: 'TODO',
          data: {}
        } satisfies CreatedAction
      ]
    }

    // Do this as very first synchronous operation so UI can trust
    // that the event is created when changing view for instance
    persistEvents((events: EventDocument[]) => {
      return [...events, optimisticEvent]
    })

    return optimisticEvent
  },
  onSuccess: async (response) => {
    await invalidateQueries()

    persistEvents((state: EventDocument[]) => {
      return [
        ...state.filter((e) => e.transactionId !== response.transactionId),
        response
      ]
    })

    await queryClient.cancelQueries({
      queryKey: getQueryKey(api.event.get, response.transactionId, 'query')
    })
  }
}))

export function createEvent() {
  return api.event.create.useMutation({})
}
