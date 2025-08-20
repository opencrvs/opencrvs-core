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
  ActionInputWithType,
  ActionStatus,
  ActionType,
  getCurrentEventState
} from '@opencrvs/commons/events'

import { getUUID } from '@opencrvs/commons'
import { getEventConfigurations } from '@events/service/config/config'
import { searchForDuplicates } from '@events/service/deduplication/deduplication'
import { addAction, getEventById } from '@events/service/events/events'
import { TrpcUserContext } from '@events/context'

export async function validate(
  input: Omit<Extract<ActionInputWithType, { type: 'VALIDATE' }>, 'duplicates'>,
  {
    user,
    token
  }: {
    user: TrpcUserContext
    token: string
  }
) {
  const configs = await getEventConfigurations(token)
  const storedEvent = await getEventById(input.eventId)
  const config = configs.find((c) => c.id === storedEvent.type)

  if (!config) {
    throw new Error(
      `Event configuration not found with type: ${storedEvent.type}`
    )
  }

  const dedupConfig = config.actions.find(
    (action) => action.type === ActionType.VALIDATE
  )?.deduplication

  if (!dedupConfig) {
    return addAction(
      { ...input, duplicates: [] },
      {
        user,
        token,
        status: ActionStatus.Accepted
      }
    )
  }
  const createdByDetails = {
    createdBy: user.id,
    createdByUserType: user.type,
    createdByRole: user.role,
    createdAtLocation: user.primaryOfficeId,
    createdBySignature: user.signature
  }

  const futureEventState = getCurrentEventState(
    {
      ...storedEvent,
      actions: [
        ...storedEvent.actions,
        {
          ...input,
          ...createdByDetails,
          createdAt: new Date().toISOString(),
          id: getUUID(),
          status: ActionStatus.Accepted
        }
      ]
    },
    config
  )

  const duplicates = await searchForDuplicates(
    futureEventState,
    dedupConfig,
    config
  )

  return addAction(
    { ...input, duplicates: duplicates.map((d) => d.event.id) },
    {
      user,
      token,
      status: ActionStatus.Accepted
    }
  )
}
