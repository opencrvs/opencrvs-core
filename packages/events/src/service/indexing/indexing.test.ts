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
import { QueryType, TENNIS_CLUB_MEMBERSHIP } from '@opencrvs/commons/events'
import { createTestClient, setupTestCase } from '@events/tests/utils'
import {
  getEventIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { indexAllEvents } from './indexing'
import {
  buildElasticQueryFromSearchPayload,
  withJurisdictionFilters
} from './query'

test('indexes all records from MongoDB with one function call', async () => {
  const { user, generator } = await setupTestCase()
  const client = createTestClient(user)

  const esClient = getOrCreateClient()

  await indexAllEvents(tennisClubMembershipEvent)

  for (let i = 0; i < 2; i++) {
    await client.event.create(generator.event.create())
  }

  const body = await esClient.search({
    index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP),
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
    index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP),
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
      eventType: TENNIS_CLUB_MEMBERSHIP,
      status: { type: 'exact', term: 'REGISTERED' }
    }
  ]
}

const exactRegisteredAtPayload: QueryType = {
  type: 'and',
  clauses: [
    {
      'legalStatus.REGISTERED.createdAt': { type: 'exact', term: '2024-01-01' },
      eventType: TENNIS_CLUB_MEMBERSHIP
    }
  ]
}

const rangeRegisteredAtPayload: QueryType = {
  type: 'and',
  clauses: [
    {
      'legalStatus.REGISTERED.createdAt': {
        type: 'range',
        gte: '2024-01-01',
        lte: '2024-12-31'
      },
      eventType: TENNIS_CLUB_MEMBERSHIP
    }
  ]
}

const exactRegisteredAtLocationPayload: QueryType = {
  type: 'and',
  clauses: [
    {
      'legalStatus.REGISTERED.createdAtLocation': {
        type: 'exact',
        term: 'some-location-id'
      },
      eventType: TENNIS_CLUB_MEMBERSHIP
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
      eventType: TENNIS_CLUB_MEMBERSHIP,
      status: { type: 'exact', term: 'ARCHIVED' },
      trackingId: { type: 'exact', term: 'ABC123' },
      createdAt: { type: 'range', gte: '2024-01-01', lte: '2024-12-31' },
      updatedAt: { type: 'exact', term: '2024-06-01' },
      createdAtLocation: { type: 'exact', term: 'some-location-id' },
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
    const result = buildElasticQueryFromSearchPayload(exactStatusPayload, [
      tennisClubMembershipEvent
    ])
    expect(result).toEqual({
      bool: {
        must: [
          {
            term: {
              type: TENNIS_CLUB_MEMBERSHIP
            }
          },
          { term: { status: 'REGISTERED' } }
        ],
        should: undefined
      }
    })
  })

  test('builds query with exact legalStatus.REGISTERED.createdAt', () => {
    const result = buildElasticQueryFromSearchPayload(
      exactRegisteredAtPayload,
      [tennisClubMembershipEvent]
    )
    expect(result).toEqual({
      bool: {
        must: [
          { term: { type: TENNIS_CLUB_MEMBERSHIP } },
          { term: { 'legalStatuses.REGISTERED.createdAt': '2024-01-01' } }
        ]
      }
    })
  })

  test('builds query with range legalStatus.REGISTERED.createdAt', () => {
    const result = buildElasticQueryFromSearchPayload(
      rangeRegisteredAtPayload,
      [tennisClubMembershipEvent]
    )
    expect(result).toEqual({
      bool: {
        must: [
          { term: { type: TENNIS_CLUB_MEMBERSHIP } },
          {
            range: {
              'legalStatuses.REGISTERED.createdAt': {
                gte: '2024-01-01',
                lte: '2024-12-31'
              }
            }
          }
        ]
      }
    })
  })

  test('builds query with exact legalStatus.REGISTERED.createdAtLocation', () => {
    const result = buildElasticQueryFromSearchPayload(
      exactRegisteredAtLocationPayload,
      [tennisClubMembershipEvent]
    )
    expect(result).toEqual({
      bool: {
        must: [
          { term: { type: TENNIS_CLUB_MEMBERSHIP } },
          {
            term: {
              'legalStatuses.REGISTERED.createdAtLocation': 'some-location-id'
            }
          }
        ]
      }
    })
  })

  test('builds query with anyOf status', () => {
    const result = buildElasticQueryFromSearchPayload(anyOfStatusPayload, [
      tennisClubMembershipEvent
    ])
    expect(result).toEqual({
      bool: {
        must: [{ terms: { status: ['REGISTERED', 'VALIDATED'] } }]
      }
    })
  })

  test('builds complex AND query', () => {
    const result = buildElasticQueryFromSearchPayload(fullAndPayload, [
      tennisClubMembershipEvent
    ])
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
    const result = buildElasticQueryFromSearchPayload(orPayload, [
      tennisClubMembershipEvent
    ])
    expect(result).toEqual({
      bool: {
        should: [
          {
            bool: {
              must: [
                { term: { type: 'foo' } },
                { term: { status: 'REGISTERED' } }
              ]
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
    const result = buildElasticQueryFromSearchPayload(
      {
        // @ts-expect-error testing invalid input
        type: 'invalid',
        clauses: [
          {
            status: {
              type: 'exact',
              term: 'ARCHIVED'
            }
          }
        ]
      },
      tennisClubMembershipEvent
    )
    expect(result).toEqual({
      bool: { must_not: { match_all: {} } }
    })
  })
})

describe('withJurisdictionFilters', () => {
  const baseQuery = {
    term: { someField: 'someValue' }
  }

  test('returns original query if no my-jurisdiction and no userOfficeId', () => {
    const options = { 'v2.birth': 'all' as const }

    const result = withJurisdictionFilters(baseQuery, options, undefined)

    expect(result).toEqual(baseQuery)
  })

  test('returns original query if no my-jurisdiction scopes are available for multiple events', () => {
    const options = { 'v2.birth': 'all' as const, 'v2.death': 'all' as const }

    const result = withJurisdictionFilters(baseQuery, options, undefined)

    expect(result).toEqual(baseQuery)
  })

  test('adds filters for my-jurisdiction eventTypes only', () => {
    const options = {
      'v2.birth': 'my-jurisdiction' as const,
      'v2.death': 'all' as const
    }

    const result = withJurisdictionFilters(baseQuery, options, 'office-123')

    expect(result).toEqual({
      bool: {
        must: [baseQuery],
        should: [
          {
            bool: {
              must: [
                { term: { type: 'v2.birth' } },
                { term: { updatedAtLocation: 'office-123' } }
              ],
              should: undefined
            }
          }
        ],
        minimum_should_match: 1
      }
    })
  })

  test('returns filtered query if multiple events are marked as my-jurisdiction', () => {
    const options = {
      'v2.birth': 'my-jurisdiction' as const,
      'v2.death': 'my-jurisdiction' as const
    }

    const result = withJurisdictionFilters(baseQuery, options, 'office-123')

    expect(result).toEqual({
      bool: {
        minimum_should_match: 1,
        must: [baseQuery],
        should: [
          {
            bool: {
              must: [
                { term: { type: 'v2.birth' } },
                { term: { updatedAtLocation: 'office-123' } }
              ],
              should: undefined
            }
          },
          {
            bool: {
              must: [
                { term: { type: 'v2.death' } },
                { term: { updatedAtLocation: 'office-123' } }
              ],
              should: undefined
            }
          }
        ]
      }
    })
  })

  test('returns filtered query if multiple events are marked with different jurisdiction access', () => {
    const options = {
      'v2.birth': 'my-jurisdiction' as const,
      'v2.death': 'all' as const
    }

    const result = withJurisdictionFilters(baseQuery, options, 'office-123')

    expect(result).toEqual({
      bool: {
        minimum_should_match: 1,
        must: [baseQuery],
        should: [
          {
            bool: {
              must: [
                { term: { type: 'v2.birth' } },
                { term: { updatedAtLocation: 'office-123' } }
              ],
              should: undefined
            }
          }
        ]
      }
    })
  })
})
