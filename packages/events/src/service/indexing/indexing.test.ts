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

import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import {
  getEventIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { indexAllEvents } from './indexing'

test('indexes all records from MongoDB with one function call', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const esClient = getOrCreateClient()

  await indexAllEvents(tennisClubMembershipEvent)

  for (let i = 0; i < 2; i++) {
    await client.event.create(generator.event.create())
  }

  const body = await esClient.search({
    index: getEventIndexName('TENNIS_CLUB_MEMBERSHIP'),
    body: {
      query: {
        match_all: {}
      }
    }
  })

  expect(body.hits.hits).toHaveLength(2)
})

test('records are automatically indexed when they are created', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  await client.event.create(generator.event.create())

  const esClient = getOrCreateClient()
  const body = await esClient.search({
    index: getEventIndexName('TENNIS_CLUB_MEMBERSHIP'),
    body: {
      query: {
        match_all: {}
      }
    }
  })

  expect(body.hits.hits).toHaveLength(1)
})
