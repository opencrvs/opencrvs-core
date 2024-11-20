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

import { getClient } from '@events/storage/mongodb'
import {
  getUUID,
  EventInput,
  Event,
  ActionInput,
  ActionType
} from '@opencrvs/commons'
import { z } from 'zod'

const EventWithTransactionId = Event.extend({
  transactionId: z.string()
})

async function getEventByTransactionId(transactionId: string) {
  const db = await getClient()
  const collection =
    db.collection<z.infer<typeof EventWithTransactionId>>('events')

  const document = await collection.findOne({ transactionId })

  return document
}
class EventNotFoundError extends Error {
  constructor(id: string) {
    super('Event not found with ID: ' + id)
  }
}

export async function getEventById(id: string) {
  const db = await getClient()

  const collection = db.collection<Event>('events')
  const event = await collection.findOne({ id: id })
  if (!event) {
    throw new EventNotFoundError(id)
  }
  return event
}

export async function createEvent(
  eventInput: z.infer<typeof EventInput>,
  transactionId: string
): Promise<Event> {
  const existingEvent = await getEventByTransactionId(transactionId)
  if (existingEvent) {
    return existingEvent
  }

  const db = await getClient()
  const collection =
    db.collection<z.infer<typeof EventWithTransactionId>>('events')

  const now = new Date()
  const id = getUUID()

  await collection.insertOne({
    ...eventInput,
    id,
    transactionId,
    createdAt: now,
    updatedAt: now,
    actions: [
      {
        type: ActionType.CREATE,
        createdAt: now,
        createdBy: '123-123-123',
        fields: []
      }
    ]
  })

  return getEventById(id)
}

export async function addAction(eventId: string, action: ActionInput) {
  const db = await getClient()
  const now = new Date()

  await db.collection<Event>('events').updateOne(
    {
      id: eventId
    },
    {
      $push: {
        actions: {
          ...action,
          createdAt: now,
          createdBy: '123-123-123'
        }
      }
    }
  )

  return getEventById(eventId)
}

export const EventInputWithId = EventInput.extend({
  id: z.string()
})

export async function patchEvent(
  event: z.infer<typeof EventInputWithId>
): Promise<Event> {
  const existingEvent = await getEventById(event.id)

  if (!existingEvent) {
    throw new EventNotFoundError(event.id)
  }

  const db = await getClient()
  const collection =
    db.collection<z.infer<typeof EventWithTransactionId>>('events')

  const now = new Date()

  await collection.updateOne(
    {
      id: event.id
    },
    {
      $set: {
        ...event,
        updatedAt: now
      }
    }
  )

  return getEventById(event.id)
}
