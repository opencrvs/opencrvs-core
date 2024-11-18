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

import { getUUID } from '@opencrvs/commons'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { getClient } from './mongodb'

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

async function getRecordByTransactionId(transactionId: string) {
  const db = await getClient()
  const collection =
    db.collection<z.infer<typeof EventWithTransactionId>>('records')

  const document = await collection.findOne({ transactionId })

  return document
}

export async function getRecordById(id: string) {
  const db = await getClient()
  const collection = db.collection<z.infer<typeof Event>>('records')
  const record = await collection.findOne({ id: id })
  if (!record) {
    throw new Error('Record not found with ID: ' + id)
  }
  return record
}

async function getRecordByMongoId(id: ObjectId) {
  const db = await getClient()
  const collection = db.collection<z.infer<typeof Event>>('records')
  const record = await collection.findOne({ _id: id })
  if (!record) {
    throw new Error('Record not found with Object ID: ' + id)
  }
  return record
}

export async function createRecord(
  recordInput: z.infer<typeof EventInput>,
  transactionId: string
): Promise<Event> {
  const existingRecord = await getRecordByTransactionId(transactionId)
  if (existingRecord) {
    return existingRecord
  }

  const db = await getClient()
  const collection =
    db.collection<z.infer<typeof EventWithTransactionId>>('records')

  const document = await collection.insertOne({
    ...recordInput,
    id: getUUID(),
    transactionId,
    createdAt: new Date(),
    actions: [
      {
        type: 'CREATED',
        createdAt: new Date(),
        createdBy: '123-123-123',
        fields: []
      }
    ]
  })

  return getRecordByMongoId(document.insertedId)
}
