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
  EventIndex,
  getCurrentEventState
} from '@opencrvs/commons/events'

import { getEventConfigurations } from '@events/service/config/config'
import { searchForDuplicates } from '@events/service/deduplication/deduplication'
import { getUUID } from '@opencrvs/commons'
import { addAction, getEventById } from '@events/service/events/events'

export async function validate(
  input: Omit<Extract<ActionInputWithType, { type: 'VALIDATE' }>, 'duplicates'>,
  {
    eventId,
    createdBy,
    token,
    createdAtLocation
  }: {
    eventId: string
    createdBy: string
    createdAtLocation: string
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
        createdAtLocation
      }
    ]
  })

  const resultsFromAllRules = await Promise.all(
    form.deduplication.map(async (deduplication) => {
      const matches = await searchForDuplicates(futureEventState, deduplication)
      return matches
    })
  )

  duplicates = resultsFromAllRules
    .flat()
    .sort((a, b) => b.score - a.score)
    .filter((hit): hit is { score: number; event: EventIndex } => !!hit.event)
    .map((hit) => hit.event)
    .filter((event, index, self) => {
      return self.findIndex((t) => t.id === event.id) === index
    })

  const event = await addAction(
    { ...input, duplicates: duplicates.map((d) => d.id) },
    {
      eventId,
      createdBy,
      token,
      createdAtLocation
    }
  )
  return event
}
