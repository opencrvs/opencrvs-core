import { vi, test, beforeAll, afterEach, expect } from 'vitest'
import { appRouter, t } from './server'
import {
  setupServer,
  getClient,
  resetServer
} from './storage/__mocks__/mongodb'

const { createCallerFactory } = t

vi.mock('./storage/mongodb.ts')

beforeAll(async () => {
  await setupServer()
})

afterEach(async () => {
  resetServer()
})

test('creating a declaration is an idempotent operation', async () => {
  const createCaller = createCallerFactory(appRouter)

  const caller = createCaller({})
  const db = await getClient()

  await caller.event.create({
    transactionId: '1',
    record: { type: 'birth', fields: [] }
  })
  await caller.event.create({
    transactionId: '1',
    record: { type: 'birth', fields: [] }
  })

  expect(await db.collection('records').find().toArray()).toHaveLength(1)
})
