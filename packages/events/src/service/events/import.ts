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
import { omit } from 'lodash'
import { EventDocument, getUUID, TokenWithBearer } from '@opencrvs/commons'
import { upsertEventWithActions } from '@events/storage/postgres/events/import'
import {
  getEventConfigurationById,
  getInMemoryEventConfigurations
} from '../config/config'
import { indexEvent, indexEventsInBulk } from '../indexing/indexing'

function mapEventActions(actions: EventDocument['actions']) {
  return actions.map(({ type, ...action }) => ({
    ...omit(action, 'type'),
    actionType: type,

    /* eslint-disable @typescript-eslint/no-explicit-any */
    annotation: (action as any).annotation ?? undefined,
    content: (action as any).content ?? undefined,
    declaration: (action as any).declaration ?? undefined,
    reasonIsDuplicate: (action as any).reason?.isDuplicate ?? undefined,
    reasonMessage: (action as any).reason?.message ?? undefined,
    registrationNumber: (action as any).registrationNumber ?? undefined,
    assignedTo: (action as any).assignedTo ?? undefined,
    requestId: (action as any).requestId ?? undefined,
    /* eslint-enable @typescript-eslint/no-explicit-any */
    createdAtLocation: action.createdAtLocation ?? null,
    originalActionId: action.originalActionId ?? null,
    createdBySignature: action.createdBySignature ?? null
  }))
}

export async function importEvent(
  eventDocument: EventDocument,
  token: TokenWithBearer
) {
  const transactionId = getUUID()
  const { actions, ...event } = eventDocument

  const eventType = event.type
  const eventActions = mapEventActions(actions)

  const createdEvent = await upsertEventWithActions(
    { ...omit(event, 'type'), eventType, transactionId },
    eventActions
  )

  const config = await getEventConfigurationById({
    eventType: event.type,
    token
  })

  await indexEvent(createdEvent, config)

  return createdEvent
}

export async function bulkImportEvents(
  events: EventDocument[],
  token: TokenWithBearer
) {
  const toIndex = []

  const eventConfigs = await getInMemoryEventConfigurations(token)

  for (const eventDocument of events) {
    const transactionId = getUUID()
    const { actions, ...event } = eventDocument

    const eventType = event.type
    const eventActions = mapEventActions(actions)

    const createdEvent = await upsertEventWithActions(
      { ...omit(event, 'type'), eventType, transactionId },
      eventActions
    )

    toIndex.push(createdEvent)
  }

  if (toIndex.length > 0) {
    await indexEventsInBulk(toIndex, eventConfigs)
  }
}
