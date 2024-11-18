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
import { getUUID } from '@opencrvs/commons'
import { z } from 'zod'

export const EventInput = z.object({
  type: z.string(),
  fields: z.array(
    z.object({
      id: z.string(),
      value: z.union([
        z.string(),
        z.number(),
        z.array(
          z.object({
            optionValues: z.array(z.string()),
            type: z.string(),
            data: z.string(),
            fileSize: z.number()
          })
        )
      ])
    })
  )
})

const ActionBase = z.object({
  type: z.enum([
    'CREATED',
    'ASSIGNMENT',
    'UNASSIGNMENT',
    'REGISTERED',
    'VALIDATED',
    'CORRECTION',
    'DUPLICATES_DETECTED'
  ]),
  createdAt: z.date(),
  createdBy: z.string(),
  fields: z.array(
    z.object({
      id: z.string(),
      value: z.union([
        z.string(),
        z.number(),
        z.array(
          z.object({
            optionValues: z.array(z.string()),
            type: z.string(),
            data: z.string(),
            fileSize: z.number()
          })
        )
      ])
    })
  )
})

const Action = z.union([
  ActionBase.extend({
    type: z.enum(['CREATED'])
  }),
  ActionBase.extend({
    type: z.enum(['REGISTERED']),
    identifiers: z.object({
      trackingId: z.string(),
      registrationNumber: z.string()
    })
  })
])

export const Event = EventInput.extend({
  id: z.string(),
  type: z.string(), // Should be replaced by a reference to a form version
  createdAt: z.date(),
  actions: z.array(Action)
})
export type Event = z.infer<typeof Event>

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
  const collection = db.collection<z.infer<typeof Event>>('events')
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
    actions: [
      {
        type: 'CREATED',
        createdAt: now,
        createdBy: '123-123-123',
        fields: []
      }
    ]
  })

  return getEventById(id)
}
