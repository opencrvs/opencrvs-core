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

import { indexAllEvents } from './indexing'
import {
  getOrCreateClient,
  resetServer as resetESServer
} from '@events/storage/__mocks__/elasticsearch'
import { createTestClient } from '@events/tests/utils'
import { payloadGenerator } from '../../tests/generators'

const client = createTestClient()
const generator = payloadGenerator()

test('indexes all records from MongoDB with one function call', async () => {
  for await (const _ of Array(2).keys()) {
    await client.event.create(generator.event.create())
  }

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

  expect(body.hits.hits).toHaveLength(2)
})

test('records are automatically indexed when they are created', async () => {
  await client.event.create(generator.event.create())

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
