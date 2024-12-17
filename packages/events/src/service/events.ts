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
  EventDocument,
  ActionInput,
  EventInput
} from '@opencrvs/commons/events'

import { getClient } from '@events/storage/mongodb'
import { ActionType, getUUID } from '@opencrvs/commons'
import { z } from 'zod'
import { indexEvent } from './indexing/indexing'
import * as _ from 'lodash'

export const EventInputWithId = EventInput.extend({
  id: z.string()
})

export type EventInputWithId = z.infer<typeof EventInputWithId>

async function getEventByTransactionId(transactionId: string) {
  const db = await getClient()
  const collection = db.collection<EventDocument>('events')

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

  const collection = db.collection<EventDocument>('events')
  const event = await collection.findOne({ id: id })

  if (!event) {
    throw new EventNotFoundError(id)
  }
  return event
}

export async function createEvent({
  eventInput,
  createdAtLocation,
  createdBy,
  transactionId
}: {
  eventInput: z.infer<typeof EventInput>
  createdBy: string
  createdAtLocation: string
  transactionId: string
}) {
  const existingEvent = await getEventByTransactionId(transactionId)

  if (existingEvent) {
    return existingEvent
  }

  const db = await getClient()
  const collection = db.collection<EventDocument>('events')

  const now = new Date().toISOString()
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
        createdBy,
        createdAtLocation,
        data: {}
      }
    ]
  } satisfies EventDocument)

  const event = await getEventById(id)
  await indexEvent(event)

  return event
}

export async function addAction(
  input: ActionInput,
  { eventId, createdBy }: { eventId: string; createdBy: string }
) {
  const db = await getClient()
  const now = new Date().toISOString()

  await db.collection<EventDocument>('events').updateOne(
    {
      id: eventId
    },
    {
      $push: {
        actions: {
          ...input,
          createdBy,
          createdAt: now
        }
      }
    }
  )

  const event = await getEventById(eventId)
  await indexEvent(event)
  return event
}

export async function patchEvent(eventInput: EventInputWithId) {
  const existingEvent = await getEventById(eventInput.id)

  if (!existingEvent) {
    throw new EventNotFoundError(eventInput.id)
  }

  const db = await getClient()
  const collection = db.collection<EventDocument>('events')

  const now = new Date().toISOString()

  await collection.updateOne(
    {
      id: eventInput.id
    },
    {
      $set: {
        ...eventInput,
        updatedAt: now
      }
    }
  )

  const event = await getEventById(existingEvent.id)
  await indexEvent(event)

  return event
}
