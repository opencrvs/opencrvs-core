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

import { v4 as uuid } from 'uuid'
import { CreatedAction, getCurrentEventState } from '@opencrvs/commons/client'
import { api, utils } from '@client/v2-events/trpc'

export function createTemporaryId() {
  return `tmp-${uuid()}`
}

export function isTemporaryId(id: string) {
  return id.startsWith('tmp-')
}

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
          id: createTemporaryId(),
          createdAt: new Date().toISOString(),
          createdBy: 'offline',
          createdAtLocation: 'TODO',
          draft: false,
          data: {}
        } satisfies CreatedAction
      ]
    }

    utils.event.get.setData(newEvent.transactionId, optimisticEvent)
    utils.event.list.setData(undefined, (eventIndices) =>
      eventIndices?.concat(getCurrentEventState(optimisticEvent))
    )
    return optimisticEvent
  },
  onSuccess: async (response, _variables, context) => {
    utils.event.get.setData(response.id, response)
    utils.event.get.setData(context.transactionId, response)
    await utils.event.list.invalidate()
  }
}))

export function createEvent() {
  return api.event.create.useMutation({})
}
