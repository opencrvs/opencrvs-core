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
import { vi } from 'vitest'
import { appRouter, t } from './router'
import {
  setupServer,
  getClient,
  resetServer
} from './storage/__mocks__/mongodb'

const { createCallerFactory } = t

vi.mock('@events/storage/mongodb')

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

  expect(await db.collection('events').find().toArray()).toHaveLength(1)
})
