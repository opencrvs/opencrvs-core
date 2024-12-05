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

import { appRouter, t } from '@events/router'
import { indexAllEvents } from './indexing'
const { createCallerFactory } = t

import {
  getOrCreateClient,
  resetServer as resetESServer
} from '@events/storage/__mocks__/elasticsearch'

function createClient() {
  const createCaller = createCallerFactory(appRouter)
  const caller = createCaller({
    user: { id: '1', primaryOfficeId: '123' },
    token: 'FAKE_TOKEN'
  })

  return caller
}

const client = createClient()

test('indexes all records from MongoDB with one function call', async () => {
  await client.event.create({
    transactionId: '1',
    type: 'birth'
  })
  await resetESServer()

  const esClient = getOrCreateClient()

  await indexAllEvents()

  const body = await esClient.search({
    index: 'events',
    body: {
      query: {
        match_all: {}
      }
    }
  })

  expect(body.hits.hits).toHaveLength(1)
})

test('records are automatically indexed', async () => {
  await client.event.create({
    transactionId: '1',
    type: 'birth'
  })

  const esClient = getOrCreateClient()
  const body = await esClient.search({
    index: 'events',
    body: {
      query: {
        match_all: {}
      }
    }
  })

  expect(body.hits.hits).toHaveLength(1)
})
