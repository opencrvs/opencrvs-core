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
import { EventDocument, getUUID } from '@opencrvs/commons'
import { createEventWithActions } from '@events/storage/postgres/events/events'
import { getEventConfigurationById } from '../config/config'
import { indexEvent } from '../indexing/indexing'

export async function importEvent(eventDocument: EventDocument, token: string) {
  const transactionId = getUUID()
  const { actions, ...event } = eventDocument

  const eventType = event.type
  const eventActions = actions.map(({ type, ...action }) => ({
    ...omit(action, 'type'),
    actionType: type,

    /* eslint-disable @typescript-eslint/no-explicit-any */
    annotation: (action as any).annotation ?? undefined,
    declaration: (action as any).declaration ?? undefined,
    reasonIsDuplicate: (action as any).reason?.isDuplicate ?? undefined,
    reasonMessage: (action as any).reason?.message ?? undefined,
    registrationNumber: (action as any).registrationNumber ?? undefined,
    assignedTo: (action as any).assignedTo ?? undefined,
    createdBySignature: action.createdBySignature ?? undefined,
    createdAtLocation: action.createdAtLocation ?? undefined,
    originalActionId: action.originalActionId ?? undefined,
    requestId: (action as any).requestId ?? undefined
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }))

  const createdEvent = await createEventWithActions(
    { ...omit(event, 'type'), eventType, transactionId },
    // @ts-expect-error -- @TODO: check type inference
    eventActions
  )

  const config = await getEventConfigurationById({
    token,
    eventType: event.type
  })
  await indexEvent(createdEvent, config)

  return createdEvent
}
