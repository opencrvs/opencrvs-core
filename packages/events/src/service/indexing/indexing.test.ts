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

import { http, HttpResponse } from 'msw'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  ActionType,
  AddressType,
  AdministrativeArea,
  createPrng,
  EventConfig,
  EventDocument,
  EventIndex,
  EventState,
  field,
  FieldConditional,
  FieldType,
  generateActionDeclarationInput,
  generateUuid,
  Location,
  LocationType,
  QueryType,
  TENNIS_CLUB_MEMBERSHIP,
  TestUserRole,
  UUID
} from '@opencrvs/commons/events'
import { encodeScope, SCOPES } from '@opencrvs/commons'
import {
  createSystemTestClient,
  createTestClient,
  setupTestCase,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'
import {
  getEventIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'
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

test('records are indexed with full location hierarchy', async () => {
  const { user, generator, seed } = await setupTestCase()

  const client = createTestClient(user, [
    ...TEST_USER_DEFAULT_SCOPES,
    encodeScope({
      type: 'record.search',
      options: {
        event: [TENNIS_CLUB_MEMBERSHIP]
      }
    })
  ])
  const esClient = getOrCreateClient()

  const locationRng = createPrng(842)

  const parentAdministrativeArea = {
    ...generator.administrativeAreas.set(1, locationRng)[0],
    name: 'Administrative Area'
  }

  const childAdministrativeArea = {
    validUntil: null,
    externalId: null,
    name: 'Child Administrative Area',
    id: user.administrativeAreaId as UUID,
    parentId: parentAdministrativeArea.id
  }

  const childLocation = {
    ...generator.locations.set(1, locationRng)[0],
    id: user.primaryOfficeId,
    administrativeAreaId: childAdministrativeArea.id,
    name: 'Child location',
    locationType: LocationType.enum.CRVS_OFFICE
  } satisfies Location

  await seed.administrativeAreas([
    parentAdministrativeArea,
    childAdministrativeArea
  ])
  await seed.locations([childLocation])

  // --- Create & move event through lifecycle --------------------------------
  const createdEvent = await client.event.create(
    generator.event.create({ type: TENNIS_CLUB_MEMBERSHIP })
  )

  const event = generator.event.actions.declare(createdEvent.id, {
    keepAssignment: true
  })

  await client.event.actions.declare.request({
    ...generator.event.actions.declare(createdEvent.id, {
      declaration: event.declaration,
      keepAssignment: true
    })
  })

  // --- Verify indexed ES document contains full hierarchy -------------------
  const searchResponse = await esClient.search({
    index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP),
    body: { query: { match_all: {} } }
  })

  expect(searchResponse.hits.hits).toHaveLength(1)

  expect(searchResponse.hits.hits[0]._source).toMatchObject({
    id: createdEvent.id,
    type: TENNIS_CLUB_MEMBERSHIP,
    status: 'DECLARED',
    createdAtLocation: [
      parentAdministrativeArea.id,
      childAdministrativeArea.id,
      childLocation.id
    ],
    updatedAtLocation: [
      parentAdministrativeArea.id,
      childAdministrativeArea.id,
      childLocation.id
    ],
    placeOfEvent: [
      parentAdministrativeArea.id,
      childAdministrativeArea.id,
      childLocation.id
    ],
    legalStatuses: {
      DECLARED: {
        createdAtLocation: [
          parentAdministrativeArea.id,
          childAdministrativeArea.id,
          childLocation.id
        ]
      }
    },
    declaration: {
      applicant____address: {
        administrativeArea: [
          parentAdministrativeArea.id,
          childAdministrativeArea.id
          // administrative area should not include location id
        ]
      }
    }
  })

  // --- Search API result must NOT contain hierarchy -------------------------
  const { results } = await client.event.search({
    query: { type: 'and', clauses: [{ eventType: TENNIS_CLUB_MEMBERSHIP }] }
  })

  expect(results).toHaveLength(1)
  expect(results[0].createdAtLocation).toEqual(childLocation.id)
  expect(results[0].updatedAtLocation).toEqual(childLocation.id)
  expect(results[0].placeOfEvent).toEqual(childLocation.id)
  expect(results[0].legalStatuses.DECLARED?.createdAtLocation).toEqual(
    childLocation.id
  )
  expect(results[0].declaration.applicant____address).toEqual(undefined) // address is stripped of from api response

  // --- Modify & re-search, hierarchy must STILL be stripped -----------------
  await client.event.actions.register.request({
    ...generator.event.actions.register(createdEvent.id, {
      declaration: {
        ...event.declaration,
        'applicant.name': {
          firstname: 'John',
          surname: 'Doe'
        }
      }
    })
  })

  const { results: results2 } = await client.event.search({
    query: { type: 'and', clauses: [{ eventType: TENNIS_CLUB_MEMBERSHIP }] }
  })

  expect(results2).toHaveLength(1)
  expect(results2[0].createdAtLocation).toEqual(childLocation.id)
  expect(results2[0].placeOfEvent).toEqual(childLocation.id)
  expect(results2[0].updatedAtLocation).toEqual(childLocation.id)
  expect(results2[0].legalStatuses.DECLARED?.createdAtLocation).toEqual(
    childLocation.id
  )
  expect(results2[0].declaration.applicant____address).toEqual(undefined) // address is stripped of from api response
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

const withinRegisteredAtLocationPayload: QueryType = {
  type: 'and',
  clauses: [
    {
      'legalStatuses.REGISTERED.createdAtLocation': {
        type: 'within',
        location: RANDOM_UUID
      },
      eventType: TENNIS_CLUB_MEMBERSHIP
    }
  ]
}

const anyOfStatusPayload: QueryType = {
  type: 'and',
  clauses: [
    {
      status: { type: 'anyOf', terms: ['REGISTERED', 'DECLARED'] }
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
      createdAtLocation: { type: 'within', location: RANDOM_UUID },
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
          }
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
          {
            bool: {
              must: [
                {
                  term: { 'legalStatuses.REGISTERED.acceptedAt': '2024-01-01' }
                },
                { term: { type: TENNIS_CLUB_MEMBERSHIP } }
              ],
              should: undefined
            }
          }
        ],
        should: undefined
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
              ],
              should: undefined
            }
          }
        ],
        should: undefined
      }
    })
  })

  test('builds query with legalStatuses.REGISTERED.createdAtLocation', async () => {
    const result = await buildElasticQueryFromSearchPayload(
      withinRegisteredAtLocationPayload,
      [tennisClubMembershipEvent]
    )
    expect(result).toEqual({
      bool: {
        must: [
          {
            bool: {
              must: [
                {
                  term: {
                    'legalStatuses.REGISTERED.createdAtLocation': RANDOM_UUID
                  }
                },
                { term: { type: TENNIS_CLUB_MEMBERSHIP } }
              ],
              should: undefined
            }
          }
        ],
        should: undefined
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
        must: [
          {
            bool: {
              must: [{ terms: { status: ['REGISTERED', 'DECLARED'] } }],
              should: undefined
            }
          }
        ],
        should: undefined
      }
    })
  })

  test('builds complex AND query', async () => {
    const result = await buildElasticQueryFromSearchPayload(fullAndPayload, [
      tennisClubMembershipEvent
    ])
    expect(result).toMatchObject({
      bool: {
        must: [
          {
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
                { term: { updatedAtLocation: RANDOM_UUID } },
                {
                  match: {
                    'declaration.applicant____name.__fullname': 'John Doe'
                  }
                }
              ]),
              should: undefined
            }
          }
        ],
        should: undefined
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
          status: { type: 'exact', term: 'DECLARED' }
        }
      ]
    }
    const result = await buildElasticQueryFromSearchPayload(orPayload, [
      tennisClubMembershipEvent
    ])
    expect(result).toEqual({
      bool: {
        minimum_should_match: 1,
        should: [
          {
            bool: {
              must: [
                { term: { type: 'foo' } },
                { term: { status: 'REGISTERED' } }
              ],
              should: undefined
            }
          },
          {
            bool: {
              must: [
                { term: { type: 'bar' } },
                { term: { status: 'DECLARED' } }
              ],
              should: undefined
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
      } as unknown as QueryType,

      [tennisClubMembershipEvent]
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

  test('returns original query if no scope filters are applied', () => {
    const result = withJurisdictionFilters({
      query: baseQuery,
      scopesV2: [
        {
          type: 'record.search',
          options: {
            event: ['birth']
          }
        }
      ]
    })

    expect(result).toEqual({
      bool: {
        must: [baseQuery],
        filter: {
          bool: {
            should: [{ bool: { must: [{ terms: { type: ['birth'] } }] } }],
            minimum_should_match: 1
          }
        }
      }
    })
  })

  test('returns original query if no "location"scopes are available for multiple events', () => {
    const result = withJurisdictionFilters({
      query: baseQuery,
      scopesV2: [
        {
          type: 'record.search',
          options: {
            event: ['birth', 'death']
          }
        }
      ]
    })

    expect(result).toEqual({
      bool: {
        must: [baseQuery],
        filter: {
          bool: {
            should: [
              {
                bool: {
                  must: [
                    {
                      terms: {
                        type: ['birth', 'death']
                      }
                    }
                  ]
                }
              }
            ],
            minimum_should_match: 1
          }
        }
      }
    })
  })

  test('adds filters for my-jurisdiction eventTypes only', () => {
    const result = withJurisdictionFilters({
      query: baseQuery,
      scopesV2: [
        {
          type: 'record.search',
          options: {
            event: ['death']
          }
        },
        {
          type: 'record.search',
          options: {
            event: ['birth'],
            placeOfEvent: 'office-123' as UUID
          }
        }
      ]
    })

    expect(result).toEqual({
      bool: {
        must: [baseQuery],
        filter: {
          bool: {
            should: [
              {
                bool: {
                  must: [
                    {
                      terms: {
                        type: ['death']
                      }
                    }
                  ]
                }
              },
              {
                bool: {
                  must: [
                    {
                      terms: {
                        type: ['birth']
                      }
                    },
                    {
                      term: {
                        placeOfEvent: 'office-123'
                      }
                    }
                  ]
                }
              }
            ],
            minimum_should_match: 1
          }
        }
      }
    })
  })

  test('returns filtered query if multiple events are marked as "location"', () => {
    const result = withJurisdictionFilters({
      query: baseQuery,
      scopesV2: [
        {
          type: 'record.search',
          options: {
            event: ['birth', 'death'],
            placeOfEvent: 'office-123' as UUID
          }
        }
      ]
    })

    expect(result).toEqual({
      bool: {
        must: [baseQuery],
        filter: {
          bool: {
            should: [
              {
                bool: {
                  must: [
                    {
                      terms: {
                        type: ['birth', 'death']
                      }
                    },
                    {
                      term: {
                        placeOfEvent: 'office-123'
                      }
                    }
                  ]
                }
              }
            ],
            minimum_should_match: 1
          }
        }
      }
    })
  })

  test('returns filtered query if multiple events are marked with different jurisdiction access', () => {
    const result = withJurisdictionFilters({
      query: baseQuery,
      scopesV2: [
        {
          type: 'record.search',
          options: {
            event: ['birth'],
            placeOfEvent: 'office-123' as UUID
          }
        },
        {
          type: 'record.search',
          options: {
            event: ['death']
          }
        }
      ]
    })

    expect(result).toEqual({
      bool: {
        must: [baseQuery],
        filter: {
          bool: {
            should: [
              {
                bool: {
                  must: [
                    {
                      terms: {
                        type: ['birth']
                      }
                    },
                    {
                      term: {
                        placeOfEvent: 'office-123'
                      }
                    }
                  ]
                }
              },
              {
                bool: {
                  must: [
                    {
                      terms: {
                        type: ['death']
                      }
                    }
                  ]
                }
              }
            ],
            minimum_should_match: 1
          }
        }
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
        {
          bool: {
            must: [
              { term: { type: 'tennis-club-membership' } },
              {
                bool: {
                  must: [
                    {
                      term: {
                        'declaration.applicant____address.country': 'FAR'
                      }
                    },
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
                  ],
                  should: undefined
                }
              }
            ],
            should: undefined
          }
        }
      ],
      should: undefined
    }
  })
})

describe('placeOfEvent location hierarchy handling', () => {
  let client: ReturnType<typeof createTestClient>
  let esClient: ReturnType<typeof getOrCreateClient>

  let declarationWithHomeAddress: EventState
  let generator: Awaited<ReturnType<typeof setupTestCase>>['generator']
  let seed: Awaited<ReturnType<typeof setupTestCase>>['seed']
  let grandParentAdministrativeArea: AdministrativeArea
  let parentAdministrativeArea: AdministrativeArea
  let childOffice: Location
  let modifiedEventConfig: EventConfig
  beforeEach(async () => {
    // Setup: Generate location IDs upfront
    const prng = createPrng(942)
    const childOfficeId = generateUuid(prng)
    const parentAdministrativeAreaId = generateUuid(prng)

    // Setup: Configure event with conditional address fields
    const createAddressField = (
      id: string,
      conditionals?: FieldConditional[]
    ) => ({
      id,
      type: FieldType.ADDRESS,
      label: {
        id: 'storybook.address.label',
        defaultMessage: 'Address',
        description: 'The title for the address input'
      },
      defaultValue: {
        country: 'FAR',
        addressType: AddressType.DOMESTIC
      },
      conditionals,
      configuration: {
        streetAddressForm: [
          {
            id: 'town',
            required: false,
            label: {
              id: 'field.address.town.label',
              defaultMessage: 'Town',
              description: 'This is the label for the field'
            },
            type: FieldType.TEXT
          }
        ]
      }
    })

    modifiedEventConfig = {
      ...tennisClubMembershipEvent,
      declaration: {
        ...tennisClubMembershipEvent.declaration,
        pages: tennisClubMembershipEvent.declaration.pages.map((page, i) => {
          if (i !== 0) {
            return page
          }
          return {
            ...page,
            fields: [
              ...page.fields.filter((x) => x.type !== FieldType.ADDRESS),
              {
                id: 'selected.address.type',
                type: FieldType.TEXT,
                label: {
                  id: 'addressType.label',
                  defaultMessage: 'Address Type',
                  description: ''
                },
                defaultValue: 'home.address'
              },
              createAddressField('home.address', [
                {
                  type: 'SHOW',
                  conditional: field('selected.address.type').isEqualTo(
                    'home.address'
                  )
                }
              ]),
              createAddressField('office.address', [
                {
                  type: 'SHOW',
                  conditional: field('selected.address.type').isEqualTo(
                    'office.address'
                  )
                }
              ]),
              {
                id: 'locationId',
                type: FieldType.ALPHA_HIDDEN,
                label: {
                  defaultMessage: 'Health Institution',
                  description: 'This is the label for the field',
                  id: 'event.birth.action.declare.form.section.child.field.birthLocation.label'
                },
                parent: [
                  field('selected.address.type'),
                  field('home.address'),
                  field('office.address')
                ],
                value: [
                  field('home.address').get('administrativeArea'),
                  field('office.address').get('administrativeArea')
                ]
              }
            ]
          }
        })
      },
      placeOfEvent: field('locationId')
    }
    mswServer.use(
      http.get(`${env.COUNTRY_CONFIG_URL}/events`, () => {
        return HttpResponse.json([modifiedEventConfig])
      })
    )

    // Setup: seed, user, client, esClient
    const { generator: g, seed: s } = await setupTestCase(
      942,
      modifiedEventConfig
    )
    generator = g
    seed = s

    const user = seed.user({
      role: TestUserRole.enum.LOCAL_REGISTRAR,
      name: [{ use: 'en', family: 'Doe', given: ['John'] }],
      primaryOfficeId: childOfficeId,
      fullHonorificName: undefined
    })

    client = createTestClient(user, [
      ...TEST_USER_DEFAULT_SCOPES,
      encodeScope({
        type: 'record.search',
        options: {
          event: [TENNIS_CLUB_MEMBERSHIP]
        }
      }),
      SCOPES.RECORD_REINDEX
    ])
    esClient = getOrCreateClient()

    // Setup: Create location hierarchy (grandparent -> parent -> child office)
    grandParentAdministrativeArea = {
      ...generator.administrativeAreas.set(1, prng)[0],
      name: 'Grand Parent administrative area'
    }
    parentAdministrativeArea = {
      ...generator.administrativeAreas.set(1, prng)[0],
      id: parentAdministrativeAreaId,
      parentId: grandParentAdministrativeArea.id,
      name: 'Parent administrative area'
    }
    childOffice = {
      ...generator.locations.set(1, prng)[0],
      id: user.primaryOfficeId,
      administrativeAreaId: parentAdministrativeAreaId,
      name: 'Child location',
      locationType: LocationType.enum.CRVS_OFFICE
    }

    await seed.administrativeAreas([
      grandParentAdministrativeArea,
      parentAdministrativeArea
    ])
    await seed.locations([childOffice])

    declarationWithHomeAddress = {
      ...generateActionDeclarationInput(
        modifiedEventConfig,
        ActionType.DECLARE,
        createPrng(100)
      ),
      'selected.address.type': 'home.address',
      'home.address': {
        country: 'FAR',
        streetLevelDetails: { town: 'Gazipur' },
        addressType: AddressType.DOMESTIC,
        administrativeArea: parentAdministrativeAreaId
      },
      locationId: parentAdministrativeAreaId
    }
  })

  test('placeOfEvent resolves from conditional address fields and returns leaf-level locations in search results', async () => {
    // Test Part 1: Declare event with home.address, verify ES contains full hierarchy
    const createdEvent = await client.event.create(
      generator.event.create({ type: TENNIS_CLUB_MEMBERSHIP })
    )

    await client.event.actions.declare.request(
      generator.event.actions.declare(createdEvent.id, {
        declaration: declarationWithHomeAddress,
        keepAssignment: true
      })
    )

    // Verify: Elasticsearch document contains full location hierarchies
    const esSearchResponse = await esClient.search({
      index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP),
      body: { query: { match_all: {} } }
    })

    expect(esSearchResponse.hits.hits).toHaveLength(1)
    expect(esSearchResponse.hits.hits[0]._source).toMatchObject({
      id: createdEvent.id,
      type: TENNIS_CLUB_MEMBERSHIP,
      status: 'DECLARED',
      createdAtLocation: [
        grandParentAdministrativeArea.id,
        parentAdministrativeArea.id,
        childOffice.id
      ],
      updatedAtLocation: [
        grandParentAdministrativeArea.id,
        parentAdministrativeArea.id,
        childOffice.id
      ],
      placeOfEvent: [
        grandParentAdministrativeArea.id,
        parentAdministrativeArea.id
      ],
      legalStatuses: {
        DECLARED: {
          createdAtLocation: [
            grandParentAdministrativeArea.id,
            parentAdministrativeArea.id,
            childOffice.id
          ]
        }
      },
      declaration: {
        home____address: {
          addressType: 'DOMESTIC',
          country: 'FAR',
          streetLevelDetails: {
            town: 'Gazipur'
          },
          administrativeArea: [
            grandParentAdministrativeArea.id,
            parentAdministrativeArea.id
          ]
        }
      }
    })

    // Verify: Search API returns only leaf-level locations (no hierarchy)
    const { results } = await client.event.search({
      query: { type: 'and', clauses: [{ eventType: TENNIS_CLUB_MEMBERSHIP }] }
    })

    expect(results).toHaveLength(1)
    expect(results[0].createdAtLocation).toEqual(childOffice.id)
    expect(results[0].updatedAtLocation).toEqual(childOffice.id)
    expect(results[0].placeOfEvent).toEqual(parentAdministrativeArea.id)
    expect(results[0].legalStatuses.DECLARED?.createdAtLocation).toEqual(
      childOffice.id
    )

    // Test Part 2: Register event with office.address, verify placeOfEvent updates correctly
    const declarationWithoutHomeAddress = Object.keys(
      declarationWithHomeAddress
    ).reduce((obj, key) => {
      if (key !== 'home.address') {
        obj[key] = (declarationWithHomeAddress as EventState)[key]
      }
      return obj
    }, {} as EventState)

    await client.event.actions.register.request(
      generator.event.actions.register(createdEvent.id, {
        declaration: {
          ...declarationWithoutHomeAddress,
          'selected.address.type': 'office.address',
          'office.address': {
            country: 'FAR',
            streetLevelDetails: { town: 'Dhaka' },
            addressType: AddressType.DOMESTIC,
            administrativeArea: grandParentAdministrativeArea.id
          },
          locationId: grandParentAdministrativeArea.id
        }
      })
    )

    // Verify: Search results still return leaf-level locations after update
    const { results: updatedResults } = await client.event.search({
      query: { type: 'and', clauses: [{ eventType: TENNIS_CLUB_MEMBERSHIP }] }
    })

    expect(updatedResults).toHaveLength(1)
    expect(updatedResults[0].createdAtLocation).toEqual(childOffice.id)
    expect(updatedResults[0].updatedAtLocation).toEqual(childOffice.id)
    expect(updatedResults[0].placeOfEvent).toEqual(
      grandParentAdministrativeArea.id
    )
    expect(updatedResults[0].legalStatuses.DECLARED?.createdAtLocation).toEqual(
      childOffice.id
    )
  })

  test('placeOfEvent hierarchy is preserved after elasticsearch reindexing', async () => {
    const NUMBER_OF_EVENTS = 2

    // Step 1: Create and declare multiple events with home address
    const createdEvents: EventDocument[] = []

    for (let i = 0; i < NUMBER_OF_EVENTS; i++) {
      const event = await client.event.create(
        generator.event.create({ type: TENNIS_CLUB_MEMBERSHIP })
      )

      await client.event.actions.declare.request(
        generator.event.actions.declare(event.id, {
          declaration: declarationWithHomeAddress,
          keepAssignment: true
        })
      )

      createdEvents.push(event)
    }

    // Step 2: Verify events are indexed correctly BEFORE reindexing
    const initialSearchResponse = await esClient.search({
      index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP),
      body: { query: { match_all: {} } }
    })

    expect(initialSearchResponse.hits.hits).toHaveLength(NUMBER_OF_EVENTS)

    const expectedLocationHierarchy = {
      type: TENNIS_CLUB_MEMBERSHIP,
      status: 'DECLARED',
      createdAtLocation: [
        grandParentAdministrativeArea.id,
        parentAdministrativeArea.id,
        childOffice.id
      ],
      updatedAtLocation: [
        grandParentAdministrativeArea.id,
        parentAdministrativeArea.id,
        childOffice.id
      ],
      placeOfEvent: [
        grandParentAdministrativeArea.id,
        parentAdministrativeArea.id
      ],
      legalStatuses: {
        DECLARED: {
          createdAtLocation: [
            grandParentAdministrativeArea.id,
            parentAdministrativeArea.id,
            childOffice.id
          ]
        }
      },
      declaration: {
        home____address: {
          addressType: 'DOMESTIC',
          country: 'FAR',
          streetLevelDetails: {
            town: 'Gazipur'
          },
          administrativeArea: [
            grandParentAdministrativeArea.id,
            parentAdministrativeArea.id
          ]
        }
      }
    }

    for (const hit of initialSearchResponse.hits.hits) {
      expect(hit._source).toMatchObject(expectedLocationHierarchy)
    }

    // Step 3: Set up mock for reindex endpoint
    const reindexSpy = vi.fn()

    mswServer.use(
      http.post(`${env.COUNTRY_CONFIG_URL}/reindex`, async (req) => {
        const body = await req.request.json()
        reindexSpy(body)
        return HttpResponse.json({})
      })
    )

    // Step 4: Perform reindexing
    const sysClient = createSystemTestClient('test-system', [
      SCOPES.RECORD_REINDEX
    ])

    await sysClient.event.reindex()

    // Refresh index to make reindexed documents searchable
    await esClient.indices.refresh({
      index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP)
    })

    // Step 5: Verify location hierarchy is preserved AFTER reindexing
    const reindexedSearchResponse = await esClient.search({
      index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP),
      body: { query: { match_all: {} } }
    })

    expect(reindexedSearchResponse.hits.hits).toHaveLength(NUMBER_OF_EVENTS)

    for (const hit of reindexedSearchResponse.hits.hits) {
      const source = hit._source as EventIndex

      // Verify this is one of our created events
      const matchingEvent = createdEvents.find((e) => e.id === source.id)
      expect(matchingEvent).toBeDefined()

      // Verify complete location hierarchy is intact
      expect(source).toMatchObject({
        id: matchingEvent?.id,
        ...expectedLocationHierarchy
      })
    }
  })

  test('records are indexed with createdAtLocation for AddressType.INTERNATIONAL', async () => {
    // Step 1: Create and declare events with international address

    const declarationWithInternationalAddress = {
      ...generateActionDeclarationInput(
        modifiedEventConfig,
        ActionType.DECLARE,
        createPrng(100)
      ),
      'selected.address.type': 'home.address',
      'home.address': {
        country: 'USA',
        addressType: AddressType.INTERNATIONAL,
        streetLevelDetails: {
          town: 'Oklahoma'
        }
      },
      locationId: undefined
    }

    const event = await client.event.create(
      generator.event.create({ type: TENNIS_CLUB_MEMBERSHIP })
    )

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, {
        declaration: declarationWithInternationalAddress,
        keepAssignment: true
      })
    )

    // Step 2: Verify events are indexed correctly BEFORE reindexing
    const initialSearchResponse = await esClient.search({
      index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP),
      body: { query: { match_all: {} } }
    })

    expect(initialSearchResponse.hits.hits).toHaveLength(1)

    const expectedLocationHierarchy = {
      type: TENNIS_CLUB_MEMBERSHIP,
      status: 'DECLARED',
      createdAtLocation: [
        grandParentAdministrativeArea.id,
        parentAdministrativeArea.id,
        childOffice.id
      ],
      updatedAtLocation: [
        grandParentAdministrativeArea.id,
        parentAdministrativeArea.id,
        childOffice.id
      ],
      placeOfEvent: [
        grandParentAdministrativeArea.id,
        parentAdministrativeArea.id,
        childOffice.id
      ],
      legalStatuses: {
        DECLARED: {
          createdAtLocation: [
            grandParentAdministrativeArea.id,
            parentAdministrativeArea.id,
            childOffice.id
          ]
        }
      },
      declaration: {
        home____address: {
          addressType: AddressType.INTERNATIONAL,
          country: 'USA',
          streetLevelDetails: {
            town: 'Oklahoma'
          }
        }
      }
    }

    expect(initialSearchResponse.hits.hits[0]._source).toMatchObject(
      expectedLocationHierarchy
    )
  })

  test('records are indexed with createdAtLocation for no placeOfEvent config', async () => {
    // Step 1: Create and declare events with international address
    mswServer.use(
      http.get(`${env.COUNTRY_CONFIG_URL}/events`, () => {
        return HttpResponse.json([
          { ...modifiedEventConfig, placeOfEvent: undefined }
        ])
      })
    )

    const event = await client.event.create(
      generator.event.create({ type: TENNIS_CLUB_MEMBERSHIP })
    )

    await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, {
        declaration: declarationWithHomeAddress,
        keepAssignment: true
      })
    )

    // Step 2: Verify events are indexed correctly BEFORE reindexing
    const initialSearchResponse = await esClient.search({
      index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP),
      body: { query: { match_all: {} } }
    })

    expect(initialSearchResponse.hits.hits).toHaveLength(1)

    const expectedLocationHierarchy = {
      type: TENNIS_CLUB_MEMBERSHIP,
      status: 'DECLARED',
      createdAtLocation: [
        grandParentAdministrativeArea.id,
        parentAdministrativeArea.id,
        childOffice.id
      ],
      updatedAtLocation: [
        grandParentAdministrativeArea.id,
        parentAdministrativeArea.id,
        childOffice.id
      ],
      placeOfEvent: [
        grandParentAdministrativeArea.id,
        parentAdministrativeArea.id,
        childOffice.id
      ],
      legalStatuses: {
        DECLARED: {
          createdAtLocation: [
            grandParentAdministrativeArea.id,
            parentAdministrativeArea.id,
            childOffice.id
          ]
        }
      },
      declaration: {
        home____address: {
          addressType: 'DOMESTIC',
          country: 'FAR',
          streetLevelDetails: {
            town: 'Gazipur'
          },
          administrativeArea: [
            grandParentAdministrativeArea.id,
            parentAdministrativeArea.id
          ]
        }
      }
    }

    expect(initialSearchResponse.hits.hits[0]._source).toMatchObject(
      expectedLocationHierarchy
    )
  })
})
