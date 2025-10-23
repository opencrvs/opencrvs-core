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

import {
  EventStatus,
  QueryInputType,
  SearchField,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import {
  getMetadataFieldConfigs,
  buildSearchQuery,
  serializeSearchParams,
  deserializeSearchParams,
  buildQuickSearchQuery,
  resolveAdvancedSearchConfig,
  getAdvancedSearchFieldErrors,
  toAdvancedSearchQueryType
} from './utils'

describe('getAdvancedSearchFieldErrors', () => {
  it('should return no errors for empty values', () => {
    const mockFormValues = { 'applicant.dob': '3' }
    const sections = resolveAdvancedSearchConfig(tennisClubMembershipEvent)
    const errors = getAdvancedSearchFieldErrors(sections, mockFormValues, {})
    expect(errors).toEqual({
      'applicant.name': [],
      'recommender.name': [],
      'applicant.email': [],
      'applicant.dob': [
        {
          message: {
            defaultMessage: 'Invalid date field',
            description: 'Error message when date field is invalid',
            id: 'error.invalidDate'
          }
        }
      ],
      'event.legalStatuses.REGISTERED.acceptedAt': [],
      'event.legalStatuses.REGISTERED.createdAtLocation': [],
      'event.status': [],
      'event.updatedAt': []
    } satisfies ReturnType<typeof getAdvancedSearchFieldErrors>)
  })
})

describe('getDefaultSearchFields', () => {
  it('should generate default search field configurations for known field IDs', () => {
    const fields = getMetadataFieldConfigs(
      tennisClubMembershipEvent.advancedSearch[0].fields
    )
    const ids = fields.map((f) => f.id)
    expect(ids).toContain('event.legalStatuses.REGISTERED.createdAtLocation')
    expect(ids).toContain('event.legalStatuses.REGISTERED.acceptedAt')
    expect(ids).toContain('event.status')
    expect(ids).toContain('event.updatedAt')
  })
})

describe('buildDataCondition', () => {
  const fields = resolveAdvancedSearchConfig(tennisClubMembershipEvent).flatMap(
    (section) => section.fields
  )
  const searchConfigs = tennisClubMembershipEvent.advancedSearch.flatMap(
    (section) => section.fields
  )
  it('should return anyOf condition for status=ALL', () => {
    const state = { 'event.status': 'ALL' }
    const result = buildSearchQuery(state, fields, searchConfigs)
    //@ts-ignore
    expect(result['event.status']).toEqual({
      type: 'anyOf',
      terms: [
        EventStatus.enum.CREATED,
        EventStatus.enum.NOTIFIED,
        EventStatus.enum.DECLARED,
        EventStatus.enum.VALIDATED,
        EventStatus.enum.REGISTERED,
        EventStatus.enum.ARCHIVED
      ]
    })
  })

  it('should generate exact match condition for trackingId', () => {
    const state = {
      'event.legalStatuses.REGISTERED.createdAtLocation': 'ABC123'
    }
    const result = buildSearchQuery(state, fields, searchConfigs)
    expect(
      //@ts-ignore
      result['event.legalStatuses.REGISTERED.createdAtLocation']
    ).toEqual({
      type: 'exact',
      term: 'ABC123'
    })
  })

  it('should generate range match condition for DATE_RANGE fields when range is selected', () => {
    const state = {
      'applicant.dob': { start: '1996-01-01', end: '1996-12-31' }
    }
    const result = buildSearchQuery(state, fields, searchConfigs)
    expect(
      //@ts-ignore
      result['applicant.dob']
    ).toEqual({
      type: 'range',
      gte: '1996-01-01',
      lte: '1996-12-31'
    })
  })

  it('should generate range match condition for DATE_RANGE fields even if exact date is selected', () => {
    const state = {
      'applicant.dob': '1996-01-01'
    }
    const result = buildSearchQuery(state, fields, searchConfigs)
    expect(
      //@ts-ignore
      result['applicant.dob']
    ).toEqual({
      type: 'range',
      gte: '1996-01-01',
      lte: '1996-01-01'
    })
  })
})

describe('serializeSearchParams and deserializeSearchParams (full roundtrip)', () => {
  const testObject = {
    str: 'hello',
    num: 123,
    bool: true,
    arrayPrimitives: ['x', 'y'],
    arrayObjects: [{ a: 1 }, { b: 2 }],
    plainObject: { foo: 'bar', count: 9 },
    emptyArray: [],
    nullVal: null,
    undefinedVal: undefined
  }

  const expectedDeserialized = {
    str: 'hello',
    num: '123', // everything comes in as string from URL
    bool: 'true',
    arrayPrimitives: ['x', 'y'],
    arrayObjects: [{ a: 1 }, { b: 2 }],
    plainObject: { foo: 'bar', count: 9 }
    // emptyArray is dropped
    // nullVal, undefinedVal are dropped
  }

  it('serializes correctly (match raw string)', () => {
    const output = serializeSearchParams(testObject)
    // Note: the order of parameters may vary, so we check the content instead.
    const expected =
      `arrayObjects=${encodeURIComponent(JSON.stringify({ a: 1 }))}` +
      `&arrayObjects=${encodeURIComponent(JSON.stringify({ b: 2 }))}` +
      '&arrayPrimitives=x&arrayPrimitives=y' +
      '&bool=true' +
      '&num=123' +
      `&plainObject=${encodeURIComponent(JSON.stringify({ foo: 'bar', count: 9 }))}` +
      '&str=hello'

    expect(output).toBe(expected)
  })

  it('deserializes correctly', () => {
    const serialized = serializeSearchParams(testObject)
    const deserialized = deserializeSearchParams(serialized)

    expect(deserialized).toEqual(expectedDeserialized)
  })

  it('roundtrip preserves data shape and content', () => {
    const serialized = serializeSearchParams(testObject)
    const roundtrip = deserializeSearchParams(serialized)

    expect(roundtrip).toEqual(expectedDeserialized)
  })
})

describe('buildQuickSearchQuery', () => {
  it('should build a quick search query', () => {
    const searchParams = { key: 'abc@gmail.com' }
    const resultQuery = buildQuickSearchQuery(searchParams, [
      tennisClubMembershipEvent
    ])

    expect(resultQuery).toEqual({
      type: 'or',
      clauses: [
        {
          data: {
            'applicant.name': {
              type: 'fuzzy',
              term: 'abc@gmail.com'
            }
          }
        },
        {
          data: {
            'applicant.email': {
              type: 'exact',
              term: 'abc@gmail.com'
            }
          }
        },
        {
          data: {
            'recommender.name': {
              type: 'fuzzy',
              term: 'abc@gmail.com'
            }
          }
        },
        {
          trackingId: {
            term: 'abc@gmail.com',
            type: 'exact'
          }
        },
        {
          'legalStatuses.REGISTERED.registrationNumber': {
            term: 'abc@gmail.com',
            type: 'exact'
          }
        }
      ]
    })
  })
})

describe('Nested Query Generation with searchFields', () => {
  it('creates OR clauses for fields with multiple searchFields', () => {
    const searchParams = {
      'person-name': 'Bob',
      'child.dob': '1985-01-01'
    }
    const searchFieldConfigs: SearchField[] = [
      {
        fieldId: 'person-name',
        fieldType: 'field',
        type: 'NAME',
        config: {
          type: 'fuzzy',
          searchFields: [
            'child.name.firstname',
            'child.name.surname',
            'mother.name.firstname',
            'father.name.firstname'
          ]
        }
      },
      {
        fieldId: 'child.dob',
        fieldType: 'field',
        config: { type: 'exact' }
      }
    ]

    const result = toAdvancedSearchQueryType(
      searchParams as unknown as QueryInputType,
      searchFieldConfigs,
      'birth'
    )

    expect(result).toEqual({
      type: 'and',
      clauses: [
        {
          eventType: 'birth'
        },
        {
          type: 'or',
          clauses: [
            {
              data: { 'child.name.firstname': 'Bob' }
            },
            {
              data: { 'child.name.surname': 'Bob' }
            },
            {
              data: { 'mother.name.firstname': 'Bob' }
            },
            {
              data: { 'father.name.firstname': 'Bob' }
            }
          ]
        },
        {
          data: { 'child.dob': '1985-01-01' }
        }
      ]
    })
  })

  it('creates individual clauses for fields without searchFields', () => {
    const searchParams = {
      'child.name.firstname': 'Alice',
      'child.dob': '1990-01-01'
    }
    const searchFieldConfigs: SearchField[] = [
      {
        fieldId: 'child.name.firstname',
        fieldType: 'field',
        config: { type: 'fuzzy' }
      },
      {
        fieldId: 'child.dob',
        fieldType: 'field',
        config: { type: 'exact' }
      }
    ]

    const result = toAdvancedSearchQueryType(
      searchParams as unknown as QueryInputType,
      searchFieldConfigs,
      'birth'
    )

    expect(result).toEqual({
      type: 'and',
      clauses: [
        {
          eventType: 'birth'
        },
        {
          data: { 'child.name.firstname': 'Alice' }
        },
        {
          data: { 'child.dob': '1990-01-01' }
        }
      ]
    })
  })

  it('handles single searchField as individual clause', () => {
    const searchParams = {
      'custom-field': 'test-value'
    }
    const searchFieldConfigs: SearchField[] = [
      {
        fieldId: 'custom-field',
        fieldType: 'field',
        config: {
          type: 'exact',
          searchFields: ['mapped.database.field'] // Single field
        }
      }
    ]

    const result = toAdvancedSearchQueryType(
      searchParams as unknown as QueryInputType,
      searchFieldConfigs,
      'birth'
    )

    expect(result).toEqual({
      type: 'and',
      clauses: [
        {
          eventType: 'birth'
        },
        {
          type: 'or',
          clauses: [
            {
              data: { 'mapped.database.field': 'test-value' }
            }
          ]
        }
      ]
    })
  })

  it('handles metadata fields correctly', () => {
    const searchParams = {
      'event.trackingId': 'ABC123',
      'person-name': 'Bob'
    }

    const searchFieldConfigs: SearchField[] = [
      {
        fieldId: 'event.trackingId',
        fieldType: 'event',
        config: { type: 'exact' }
      },
      {
        fieldId: 'person-name',
        fieldType: 'field',
        config: {
          type: 'fuzzy',
          searchFields: ['child.name.firstname', 'mother.name.firstname']
        }
      }
    ]

    const result = toAdvancedSearchQueryType(
      searchParams as unknown as QueryInputType,
      searchFieldConfigs,
      'birth'
    )

    expect(result).toEqual({
      type: 'and',
      clauses: [
        {
          trackingId: 'ABC123',
          eventType: 'birth'
        },
        {
          type: 'or',
          clauses: [
            {
              data: { 'child.name.firstname': 'Bob' }
            },
            {
              data: { 'mother.name.firstname': 'Bob' }
            }
          ]
        }
      ]
    })
  })

  it('handles complex multi-field scenario', () => {
    const searchParams = {
      'applicant-name': 'John',
      'contact-info': 'john@example.com',
      'event.status': 'REGISTERED',
      'birth.date': '1980-01-01'
    }

    const searchFieldConfigs: SearchField[] = [
      {
        fieldId: 'applicant-name',
        fieldType: 'field',
        config: {
          type: 'fuzzy',
          searchFields: [
            'child.name.firstname',
            'child.name.surname',
            'informant.name.firstname',
            'informant.name.surname'
          ]
        }
      },
      {
        fieldId: 'contact-info',
        fieldType: 'field',
        config: {
          type: 'exact',
          searchFields: [
            'child.email',
            'informant.email',
            'child.phone',
            'informant.phone'
          ]
        }
      },
      {
        fieldId: 'event.status',
        fieldType: 'event',
        config: { type: 'exact' }
      },
      {
        fieldId: 'birth.date',
        fieldType: 'field',
        config: { type: 'exact' }
      }
    ]

    const result = toAdvancedSearchQueryType(
      searchParams as unknown as QueryInputType,
      searchFieldConfigs,
      'birth'
    )

    expect(result).toEqual({
      type: 'and',
      clauses: [
        {
          status: 'REGISTERED',
          eventType: 'birth'
        },
        {
          type: 'or',
          clauses: [
            {
              data: { 'child.name.firstname': 'John' }
            },
            {
              data: { 'child.name.surname': 'John' }
            },
            {
              data: { 'informant.name.firstname': 'John' }
            },
            {
              data: { 'informant.name.surname': 'John' }
            }
          ]
        },
        {
          type: 'or',
          clauses: [
            {
              data: { 'child.email': 'john@example.com' }
            },
            {
              data: { 'informant.email': 'john@example.com' }
            },
            {
              data: { 'child.phone': 'john@example.com' }
            },
            {
              data: { 'informant.phone': 'john@example.com' }
            }
          ]
        },
        {
          data: { 'birth.date': '1980-01-01' }
        }
      ]
    })
  })
})
