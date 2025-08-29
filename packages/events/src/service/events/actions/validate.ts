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
  EventIndex,
  getCurrentEventState
} from '@opencrvs/commons/events'

import { getUUID, UUID } from '@opencrvs/commons'
import { getInMemoryEventConfigurations } from '@events/service/config/config'
import { searchForDuplicates } from '@events/service/deduplication/deduplication'
import { addAction, getEventById } from '@events/service/events/events'
import { TrpcUserContext } from '@events/context'

export async function validate(
  input: Omit<Extract<ActionInputWithType, { type: 'VALIDATE' }>, 'duplicates'>,
  {
    eventId,
    user,
    token
  }: {
    eventId: UUID
    user: TrpcUserContext
    token: string
  }
) {
  const configs = await getInMemoryEventConfigurations(token)
  const storedEvent = await getEventById(eventId)
  const config = configs.find((c) => c.id === storedEvent.type)

  if (!config) {
    throw new Error(
      `Event configuration not found with type: ${storedEvent.type}`
    )
  }

  let duplicates: EventIndex[] = []

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

  const resultsFromAllRules = await Promise.all(
    config.deduplication.map(async (deduplication) => {
      const matches = await searchForDuplicates(
        futureEventState,
        deduplication,
        config
      )
      return matches
    })
  )

  /*
   * Takes all hits using all possible deduplication rules and
   * sorts them by score. Then removes duplicates from the list.
   */

  duplicates = resultsFromAllRules
    .flat()
    // Sort results to ascending order
    .sort((a, b) => b.score - a.score)
    .filter((hit): hit is { score: number; event: EventIndex } => !!hit.event)
    .map((hit) => hit.event)
    // Remove duplicates
    .filter((event, index, self) => {
      return self.findIndex((t) => t.id === event.id) === index
    })

  return addAction(
    { ...input, duplicates: duplicates.map((d) => d.id) },
    {
      eventId,
      user,
      token,
      status: ActionStatus.Accepted
    }
  )
}
