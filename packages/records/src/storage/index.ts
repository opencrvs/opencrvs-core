import { getUUID } from '@opencrvs/commons'
import { MongoClient, ObjectId } from 'mongodb'
import { z } from 'zod'

const url = 'mongodb://localhost:27017'
const client = new MongoClient(url)

const dbName = 'records'

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

async function getClient() {
  await client.connect()
  const db = client.db(dbName)
  return db
}

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
