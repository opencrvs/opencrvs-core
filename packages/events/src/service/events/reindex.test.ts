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

import { TRPCError } from '@trpc/server'
import { http, HttpResponse } from 'msw'
import {
  ActionStatus,
  ActionType,
  EventDocument,
  generateEventDocument,
  getUUID,
  SCOPES,
  TENNIS_CLUB_MEMBERSHIP
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { createSystemTestClient, setupTestCase } from '@events/tests/utils'
import {
  getEventIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

const spy = vi.fn()

const postHandler = http.post(
  `${env.COUNTRY_CONFIG_URL}/reindex`,
  async (req) => {
    const body = await req.request.json()
    spy(body)

    return HttpResponse.json({})
  }
)

let event: EventDocument

beforeEach(async () => {
  mswServer.use(postHandler)
  spy.mockReset()
  const { user, eventsDb } = await setupTestCase()

  event = generateEventDocument({
    user,
    configuration: tennisClubMembershipEvent,
    actions: [ActionType.CREATE, ActionType.DECLARE]
  })

  const eventInDb = await eventsDb
    .insertInto('events')
    .values({
      eventType: event.type,
      transactionId: getUUID(),
      trackingId: event.trackingId,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    })
    .returning('id')
    .executeTakeFirst()

  await eventsDb
    .insertInto('eventActions')
    .values({
      id: getUUID(),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      eventId: eventInDb!.id,
      actionType: ActionType.CREATE,
      createdBy: user.id,
      createdAt: event.createdAt,
      status: ActionStatus.Accepted,
      createdByRole: user.role,
      createdByUserType: 'user',
      transactionId: getUUID()
    })
    .execute()
})

test(`prevents forbidden access if missing required scope`, async () => {
  const client = createSystemTestClient('test-system', [])

  await expect(client.event.reindex()).rejects.toMatchObject(
    new TRPCError({ code: 'FORBIDDEN' })
  )
})

test('allows access with reindex scope', async () => {
  const client = createSystemTestClient('test-system', [SCOPES.REINDEX])

  await expect(client.event.reindex()).resolves.not.toThrow()
})

test('reindexing indexes all events into Elasticsearch', async () => {
  const client = createSystemTestClient('test-system', [SCOPES.REINDEX])

  await expect(client.event.reindex()).resolves.not.toThrow()

  const esClient = getOrCreateClient()

  // Reindex doesn't refresh the index automatically, as it would block the event stream unnecessarily
  // So we need to manually refresh the index to see the changes
  await esClient.indices.refresh({
    index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP)
  })

  const body = await esClient.search({
    index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP),
    body: {
      query: {
        match_all: {}
      }
    }
  })

  expect(spy.mock.calls[0]).toHaveLength(1)
  expect(body.hits.hits).toHaveLength(1)
})

test('reindexing twice', async () => {
  const client = createSystemTestClient('test-system', [SCOPES.REINDEX])

  await expect(client.event.reindex()).resolves.not.toThrow()
  await expect(client.event.reindex()).resolves.not.toThrow()
  await expect(client.event.reindex()).resolves.not.toThrow()

  const esClient = getOrCreateClient()

  await esClient.indices.refresh({
    index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP)
  })

  const body = await esClient.search({
    index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP),
    body: {
      query: {
        match_all: {}
      }
    }
  })

  expect(postHandler.isUsed).toBe(true)
  expect(body.hits.hits).toHaveLength(1)
})
