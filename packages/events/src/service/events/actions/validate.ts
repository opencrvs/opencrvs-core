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

import { getUUID } from '@opencrvs/commons'
import { getEventConfigurations } from '@events/service/config/config'
import { searchForDuplicates } from '@events/service/deduplication/deduplication'
import { addAction, getEventById } from '@events/service/events/events'

export async function validate(
  input: Omit<Extract<ActionInputWithType, { type: 'VALIDATE' }>, 'duplicates'>,
  {
    eventId,
    createdBy,
    token,
    transactionId,
    updatedAtLocation
  }: {
    eventId: string
    createdBy: string
    updatedAtLocation: string
    transactionId: string
    token: string
  }
) {
  const config = await getEventConfigurations(token)
  const storedEvent = await getEventById(eventId)
  const form = config.find((c) => c.id === storedEvent.type)

  if (!form) {
    throw new Error(`Form not found with event type: ${storedEvent.type}`)
  }

  let duplicates: EventIndex[] = []

  const futureEventState = getCurrentEventState({
    ...storedEvent,
    actions: [
      ...storedEvent.actions,
      {
        ...input,
        createdAt: new Date().toISOString(),
        createdBy,
        id: getUUID(),
        updatedAtLocation,
        status: ActionStatus.Accepted
      }
    ]
  })

  const resultsFromAllRules = await Promise.all(
    form.deduplication.map(async (deduplication) => {
      const matches = await searchForDuplicates(futureEventState, deduplication)
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
      createdBy,
      transactionId,
      token,
      updatedAtLocation,
      status: ActionStatus.Accepted
    }
  )
}
