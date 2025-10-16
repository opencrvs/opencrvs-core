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
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import {
  getMetadataFieldConfigs,
  buildSearchQuery,
  serializeSearchParams,
  deserializeSearchParams,
  buildQuickSearchQuery,
  resolveAdvancedSearchConfig,
  getAdvancedSearchFieldErrors
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
