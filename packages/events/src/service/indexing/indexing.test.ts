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
import { QueryType } from '@opencrvs/commons/events'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import {
  getEventIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { indexAllEvents } from './indexing'
import { buildElasticQueryFromSearchPayload } from './query'

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

const exactStatusPayload: QueryType = {
  type: 'and',
  clauses: [
    {
      eventType: 'tennis-club-membership',
      status: { type: 'exact', term: 'REGISTERED' }
    }
  ]
}

const anyOfStatusPayload: QueryType = {
  type: 'and',
  clauses: [
    {
      status: { type: 'anyOf', terms: ['REGISTERED', 'VALIDATED'] }
    }
  ]
}

const fullAndPayload: QueryType = {
  type: 'and',
  clauses: [
    {
      eventType: 'tennis-club-membership',
      status: { type: 'exact', term: 'ARCHIVED' },
      trackingId: { type: 'exact', term: 'ABC123' },
      createdAt: { type: 'range', gte: '2024-01-01', lte: '2024-12-31' },
      updatedAt: { type: 'exact', term: '2024-06-01' },
      createAtLocation: { type: 'exact', term: 'some-location-id' },
      updatedAtLocation: {
        type: 'within',
        location: 'some-location-id'
      },
      data: {
        name: { type: 'exact', term: 'John Doe' }
      }
    }
  ]
}

describe('test buildElasticQueryFromSearchPayload', () => {
  test('builds query with exact status', () => {
    const result = buildElasticQueryFromSearchPayload(exactStatusPayload)
    expect(result).toEqual({
      bool: {
        must: [
          {
            term: {
              type: 'tennis-club-membership'
            }
          },
          { term: { status: 'REGISTERED' } }
        ],
        should: undefined
      }
    })
  })

  test('builds query with anyOf status', () => {
    const result = buildElasticQueryFromSearchPayload(anyOfStatusPayload)
    expect(result).toEqual({
      bool: {
        must: [{ terms: { status: ['REGISTERED', 'VALIDATED'] } }]
      }
    })
  })

  test('builds complex AND query', () => {
    const result = buildElasticQueryFromSearchPayload(fullAndPayload)
    expect(result).toMatchObject({
      bool: {
        must: expect.arrayContaining([
          { term: { status: 'ARCHIVED' } },
          { term: { trackingId: 'ABC123' } },
          { range: { createdAt: { gte: '2024-01-01', lte: '2024-12-31' } } },
          { term: { updatedAt: '2024-06-01' } },
          { term: { createdAtLocation: 'some-location-id' } },
          {
            geo_distance: {
              distance: '10km',
              location: 'some-location-id'
            }
          },
          { match: { 'declaration.name': 'John Doe' } }
        ])
      }
    })
  })

  test('builds OR query with multiple clauses', () => {
    const orPayload: QueryType = {
      type: 'or',
      clauses: [
        {
          eventType: 'foo',
          status: { type: 'exact', term: 'REGISTERED' }
        },
        {
          eventType: 'bar',
          status: { type: 'exact', term: 'REJECTED' }
        }
      ]
    }
    const result = buildElasticQueryFromSearchPayload(orPayload)
    expect(result).toEqual({
      bool: {
        should: [
          {
            bool: {
              must: [{ term: { type: 'foo' } }, { term: { status: 'ISSUED' } }]
            }
          },
          {
            bool: {
              must: [
                { term: { type: 'bar' } },
                { term: { status: 'REJECTED' } }
              ]
            }
          }
        ]
      }
    })
  })

  test('returns match_all for invalid input', () => {
    const result = buildElasticQueryFromSearchPayload({
      // @ts-expect-error testing invalid input
      type: 'invalid',
      clauses: []
    })
    expect(result).toEqual({
      bool: { must_not: { match_all: {} } }
    })
  })
})
