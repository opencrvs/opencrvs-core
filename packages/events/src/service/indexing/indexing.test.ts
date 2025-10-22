/* eslint-disable max-lines */
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
import {
  buildElasticQueryFromSearchPayload,
  withJurisdictionFilters
} from './query'

test('records are not indexed when they are created', async () => {
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

  expect(body.hits.hits).toHaveLength(0)
})
const RANDOM_UUID = '650a711b-a725-48f9-a92f-794b4a04fea6'
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
      'legalStatuses.REGISTERED.acceptedAt': {
        type: 'exact',
        term: '2024-01-01'
      },
      eventType: TENNIS_CLUB_MEMBERSHIP
    }
  ]
}

const rangeRegisteredAtPayload: QueryType = {
  type: 'and',
  clauses: [
    {
      'legalStatuses.REGISTERED.acceptedAt': {
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
      'legalStatuses.REGISTERED.createdAtLocation': {
        type: 'exact',
        term: RANDOM_UUID
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
      createdAtLocation: { type: 'exact', term: RANDOM_UUID },
      updatedAtLocation: {
        type: 'within',
        location: RANDOM_UUID
      },
      data: {
        'applicant.name': { type: 'exact', term: 'John Doe' }
      }
    }
  ]
}

const addressPayload: QueryType = {
  type: 'and',
  clauses: [
    {
      eventType: 'tennis-club-membership',
      data: {
        'applicant.address': {
          type: 'exact',
          term: '{"country":"FAR","addressType":"DOMESTIC","administrativeArea":"7a150651-15f3-49ac-8746-e907340736b0","streetLevelDetails":{"town":"Joynogor government officer\'s apartment complex"}}'
        }
      }
    }
  ]
}

describe('test buildElasticQueryFromSearchPayload', () => {
  test('builds query with exact status', async () => {
    const result = await buildElasticQueryFromSearchPayload(
      exactStatusPayload,
      [tennisClubMembershipEvent]
    )
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

  test('builds query with exact legalStatuses.REGISTERED.acceptedAt', async () => {
    const result = await buildElasticQueryFromSearchPayload(
      exactRegisteredAtPayload,
      [tennisClubMembershipEvent]
    )
    expect(result).toEqual({
      bool: {
        must: [
          { term: { 'legalStatuses.REGISTERED.acceptedAt': '2024-01-01' } },
          { term: { type: TENNIS_CLUB_MEMBERSHIP } }
        ]
      }
    })
  })

  test('builds query with range legalStatuses.REGISTERED.acceptedAt', async () => {
    const result = await buildElasticQueryFromSearchPayload(
      rangeRegisteredAtPayload,
      [tennisClubMembershipEvent]
    )
    expect(result).toEqual({
      bool: {
        must: [
          {
            range: {
              'legalStatuses.REGISTERED.acceptedAt': {
                gte: '2024-01-01',
                lte: '2024-12-31',
                time_zone: 'Asia/Dhaka'
              }
            }
          },
          { term: { type: TENNIS_CLUB_MEMBERSHIP } }
        ]
      }
    })
  })

  test('builds query with exact legalStatuses.REGISTERED.createdAtLocation', async () => {
    const result = await buildElasticQueryFromSearchPayload(
      exactRegisteredAtLocationPayload,
      [tennisClubMembershipEvent]
    )
    expect(result).toEqual({
      bool: {
        must: [
          {
            term: {
              'legalStatuses.REGISTERED.createdAtLocation': RANDOM_UUID
            }
          },
          { term: { type: TENNIS_CLUB_MEMBERSHIP } }
        ]
      }
    })
  })

  test('builds query with anyOf status', async () => {
    const result = await buildElasticQueryFromSearchPayload(
      anyOfStatusPayload,
      [tennisClubMembershipEvent]
    )
    expect(result).toEqual({
      bool: {
        must: [{ terms: { status: ['REGISTERED', 'VALIDATED'] } }]
      }
    })
  })

  test('builds complex AND query', async () => {
    const result = await buildElasticQueryFromSearchPayload(fullAndPayload, [
      tennisClubMembershipEvent
    ])
    expect(result).toMatchObject({
      bool: {
        must: expect.arrayContaining([
          { term: { type: 'tennis-club-membership' } },
          { term: { status: 'ARCHIVED' } },
          { term: { trackingId: 'ABC123' } },
          {
            range: {
              createdAt: {
                gte: '2024-01-01',
                lte: '2024-12-31',
                time_zone: 'Asia/Dhaka'
              }
            }
          },
          { term: { updatedAt: '2024-06-01' } },
          { term: { createdAtLocation: RANDOM_UUID } },
          {
            bool: {
              minimum_should_match: 1,
              should: [
                {
                  term: {
                    updatedAtLocation: RANDOM_UUID
                  }
                }
              ]
            }
          },
          { match: { 'declaration.applicant____name.__fullname': 'John Doe' } }
        ])
      }
    })
  })

  test('builds OR query with multiple clauses', async () => {
    const orPayload: QueryType = {
      type: 'or',
      clauses: [
        {
          eventType: 'foo',
          status: { type: 'exact', term: 'REGISTERED' }
        },
        {
          eventType: 'bar',
          status: { type: 'exact', term: 'VALIDATED' }
        }
      ]
    }
    const result = await buildElasticQueryFromSearchPayload(orPayload, [
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
                { term: { status: 'VALIDATED' } }
              ]
            }
          }
        ]
      }
    })
  })

  test('builds nested AND/OR query', async () => {
    const nestedPayload: QueryType = {
      type: 'and',
      clauses: [
        {
          type: 'or',
          clauses: [
            {
              eventType: TENNIS_CLUB_MEMBERSHIP,
              data: {
                'applicant.name': { type: 'exact', term: 'Bob' }
              }
            },
            {
              eventType: TENNIS_CLUB_MEMBERSHIP,
              data: {
                'applicant.email': { type: 'exact', term: 'bob@example.com' }
              }
            }
          ]
        },
        {
          eventType: TENNIS_CLUB_MEMBERSHIP,
          data: {
            'applicant.dob': { type: 'exact', term: '1985-01-01' }
          }
        }
      ]
    }
    const result = await buildElasticQueryFromSearchPayload(nestedPayload, [
      tennisClubMembershipEvent
    ])
    expect(result).toEqual({
      bool: {
        must: [
          {
            bool: {
              should: [
                {
                  bool: {
                    must: [
                      { term: { type: TENNIS_CLUB_MEMBERSHIP } },
                      {
                        match: {
                          'declaration.applicant____name.__fullname': 'Bob'
                        }
                      }
                    ],
                    should: undefined
                  }
                },
                {
                  bool: {
                    must: [
                      { term: { type: TENNIS_CLUB_MEMBERSHIP } },
                      {
                        match: {
                          'declaration.applicant____email': 'bob@example.com'
                        }
                      }
                    ],
                    should: undefined
                  }
                }
              ],
              minimum_should_match: 1
            }
          },
          {
            bool: {
              must: [
                { term: { type: TENNIS_CLUB_MEMBERSHIP } },
                { match: { 'declaration.applicant____dob': '1985-01-01' } }
              ],
              should: undefined
            }
          }
        ],
        should: undefined
      }
    })
  })

  test('returns match_all for invalid input', async () => {
    const result = await buildElasticQueryFromSearchPayload(
      {
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
      // @ts-expect-error testing invalid input
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
    const options = { birth: 'all' as const }

    const result = withJurisdictionFilters(baseQuery, options, undefined)

    expect(result).toEqual({
      bool: {
        must: [baseQuery],
        filter: {
          bool: {
            minimum_should_match: 1,
            should: [
              {
                bool: {
                  must: [
                    {
                      term: {
                        type: 'birth'
                      }
                    }
                  ],
                  should: undefined
                }
              }
            ]
          }
        },
        should: undefined
      }
    })
  })

  test('returns original query if no my-jurisdiction scopes are available for multiple events', () => {
    const options = { birth: 'all' as const, death: 'all' as const }

    const result = withJurisdictionFilters(baseQuery, options, undefined)

    expect(result).toEqual({
      bool: {
        must: [baseQuery],
        filter: {
          bool: {
            minimum_should_match: 1,
            should: [
              {
                bool: {
                  must: [{ term: { type: 'birth' } }]
                }
              },
              {
                bool: {
                  must: [{ term: { type: 'death' } }]
                }
              }
            ]
          }
        }
      }
    })
  })

  test('adds filters for my-jurisdiction eventTypes only', () => {
    const options = {
      birth: 'my-jurisdiction' as const,
      death: 'all' as const
    }

    const result = withJurisdictionFilters(baseQuery, options, 'office-123')

    expect(result).toEqual({
      bool: {
        must: [baseQuery],
        filter: {
          bool: {
            minimum_should_match: 1,
            should: [
              {
                bool: {
                  must: [
                    { term: { type: 'birth' } },
                    { term: { updatedAtLocation: 'office-123' } }
                  ]
                }
              },
              {
                bool: {
                  must: [{ term: { type: 'death' } }]
                }
              }
            ]
          }
        }
      }
    })
  })

  test('returns filtered query if multiple events are marked as my-jurisdiction', () => {
    const options = {
      birth: 'my-jurisdiction' as const,
      death: 'my-jurisdiction' as const
    }

    const result = withJurisdictionFilters(baseQuery, options, 'office-123')

    expect(result).toEqual({
      bool: {
        must: [baseQuery],
        filter: {
          bool: {
            minimum_should_match: 1,
            should: [
              {
                bool: {
                  must: [
                    { term: { type: 'birth' } },
                    { term: { updatedAtLocation: 'office-123' } }
                  ]
                }
              },
              {
                bool: {
                  must: [
                    { term: { type: 'death' } },
                    { term: { updatedAtLocation: 'office-123' } }
                  ]
                }
              }
            ]
          }
        }
      }
    })
  })

  test('returns filtered query if multiple events are marked with different jurisdiction access', () => {
    const options = {
      birth: 'my-jurisdiction' as const,
      death: 'all' as const
    }

    const result = withJurisdictionFilters(baseQuery, options, 'office-123')

    expect(result).toEqual({
      bool: {
        filter: {
          bool: {
            minimum_should_match: 1,
            should: [
              {
                bool: {
                  must: [
                    { term: { type: 'birth' } },
                    { term: { updatedAtLocation: 'office-123' } }
                  ]
                }
              },
              {
                bool: {
                  must: [{ term: { type: 'death' } }]
                }
              }
            ]
          }
        },
        must: [baseQuery]
      }
    })
  })
})

test('builds Address field query', async () => {
  const result = await buildElasticQueryFromSearchPayload(addressPayload, [
    tennisClubMembershipEvent
  ])
  expect(result).toEqual({
    bool: {
      must: [
        { term: { type: 'tennis-club-membership' } },
        {
          bool: {
            must: [
              { term: { 'declaration.applicant____address.country': 'FAR' } },
              {
                term: {
                  'declaration.applicant____address.administrativeArea':
                    '7a150651-15f3-49ac-8746-e907340736b0'
                }
              },
              {
                match: {
                  'declaration.applicant____address.streetLevelDetails.town':
                    "Joynogor government officer's apartment complex"
                }
              }
            ]
          }
        }
      ]
    }
  })
})
