/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  searchComposition,
  formatSearchParams
} from '@search/features/search/service'
import { client } from '@search/elasticsearch/client'
import { SortOrder } from '@search/features/search/types'

describe('elasticsearch db helper', () => {
  it('should index a composition with proper configuration', async () => {
    const searchSpy = jest.spyOn(client, 'search')
    const searchQuery = {
      query: 'some query',
      trackingId: 'dummy',
      contactNumber: 'dummy',
      registrationNumber: 'dummy',
      event: 'EMPTY_STRING',
      status: ['DECLARED'],
      type: ['birth-application', 'death-application'],
      applicationLocationId: 'EMPTY_STRING',
      from: 0,
      size: 10
    }
    searchComposition(searchQuery)
    expect(searchSpy).toBeCalled()
  })

  it('should index a composition with minimum configuration', async () => {
    const searchSpy = jest.spyOn(client, 'search')
    searchComposition({})
    expect(searchSpy).toBeCalled()
  })

  it('should index a composition and call combination search configuration', async () => {
    const searchSpy = jest.spyOn(client, 'search')
    const searchQuery = {
      query: 'some query',
      trackingId: 'dummy',
      contactNumber: 'dummy',
      registrationNumber: 'dummy',
      event: 'EMPTY_STRING',
      status: ['DECLARED'],
      type: ['birth-application', 'death-application'],
      applicationLocationId: 'EMPTY_STRING',
      from: 0,
      size: 10
    }
    searchComposition(searchQuery)
    expect(searchSpy).toBeCalled()
  })
})

describe('elasticsearch params formatter', () => {
  it('should prepare search params to search birth applications using a single name against all fields', () => {
    const params = formatSearchParams({
      query: 'some query',
      trackingId: 'myTrackingId',
      contactNumber: '07989898989',
      registrationNumber: 'BHGUGKJH',
      event: 'EMPTY_STRING',
      status: ['DECLARED'],
      type: ['birth-application'],
      applicationLocationId: '123',
      eventLocationId: '456',
      gender: 'male',
      name: 'Anik',
      nameCombinations: [],
      createdBy: 'EMPTY_STRING',
      from: 0,
      size: 10,
      sort: SortOrder.ASC
    })

    expect(params).toEqual({
      type: 'compositions',
      from: 0,
      index: 'ocrvs',
      size: 10,
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: 'some query',
                  fields: [
                    'childFirstNames',
                    'childFamilyName',
                    'childFirstNamesLocal',
                    'childFamilyNameLocal',
                    'deceasedFirstNames',
                    'deceasedFamilyName',
                    'deceasedFirstNamesLocal',
                    'deceasedFamilyNameLocal',
                    'trackingId',
                    'registrationNumber',
                    'contactNumber'
                  ],
                  fuzziness: 'AUTO'
                }
              },
              {
                multi_match: {
                  query: 'Anik',
                  fields: [
                    'childFirstNames',
                    'childFamilyName',
                    'childFirstNamesLocal',
                    'childFamilyNameLocal',
                    'motherFirstNames',
                    'motherFamilyName',
                    'motherFirstNamesLocal',
                    'motherFamilyNameLocal',
                    'fatherFirstNames',
                    'fatherFamilyName',
                    'fatherFirstNamesLocal',
                    'fatherFamilyNameLocal',
                    'informantFirstNames',
                    'informantFamilyName',
                    'informantFirstNamesLocal',
                    'informantFamilyNameLocal',
                    'primaryCaregiverFirstNames',
                    'primaryCaregiverFamilyName',
                    'primaryCaregiverFirstNamesLocal',
                    'primaryCaregiverFamilyNameLocal',
                    'deceasedFirstNames',
                    'deceasedFamilyName',
                    'deceasedFirstNamesLocal',
                    'deceasedFamilyNameLocal',
                    'spouseFirstNames',
                    'spouseFamilyName',
                    'spouseFirstNamesLocal',
                    'spouseFamilyNameLocal'
                  ],
                  fuzziness: 'AUTO'
                }
              },
              {
                term: {
                  'trackingId.keyword': 'myTrackingId'
                }
              },
              {
                term: {
                  'contactNumber.keyword': '07989898989'
                }
              },
              {
                term: {
                  'registrationNumber.keyword': 'BHGUGKJH'
                }
              },
              {
                term: {
                  'gender.keyword': 'male'
                }
              },
              {
                term: {
                  'eventLocationId.keyword': {
                    value: '456',
                    // tslint:disable-next-line
                    boost: 2.0
                  }
                }
              },
              {
                term: {
                  'applicationLocationId.keyword': {
                    value: '123',
                    // tslint:disable-next-line
                    boost: 2.0
                  }
                }
              },
              {
                term: {
                  'createdBy.keyword': {
                    value: 'EMPTY_STRING'
                  }
                }
              },
              {
                term: {
                  'event.keyword': 'EMPTY_STRING'
                }
              },
              {
                terms: {
                  'type.keyword': ['DECLARED']
                }
              },
              {
                terms: {
                  'compositionType.keyword': ['birth-application']
                }
              }
            ],
            should: []
          }
        },
        sort: [{ dateOfApplication: 'asc' }]
      }
    })
  })
  it('should prepare search params to search birth applications using specific names against specific fields', () => {
    const params = formatSearchParams({
      query: '',
      trackingId: 'myTrackingId',
      contactNumber: '07989898989',
      registrationNumber: 'BHGUGKJH',
      event: 'EMPTY_STRING',
      status: ['DECLARED'],
      type: ['birth-application'],
      applicationLocationId: '123',
      eventLocationId: '456',
      gender: 'male',
      name: 'EMPTY_STRING',
      nameCombinations: [
        {
          name: 'child name',
          fields: 'CHILD_FAMILY'
        },
        {
          name: 'mother name',
          fields: 'MOTHER_FAMILY'
        }
      ],
      createdBy: 'EMPTY_STRING',
      from: 0,
      size: 10,
      sort: SortOrder.ASC,
      sortColumn: 'modifiedAt.keyword'
    })

    expect(params).toEqual({
      type: 'compositions',
      from: 0,
      index: 'ocrvs',
      size: 10,
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: 'child name',
                  fields: ['childFamilyName', 'childFamilyNameLocal'],
                  fuzziness: 'AUTO'
                }
              },
              {
                multi_match: {
                  query: 'mother name',
                  fields: ['motherFamilyName', 'motherFamilyNameLocal'],
                  fuzziness: 'AUTO'
                }
              },
              {
                term: {
                  'trackingId.keyword': 'myTrackingId'
                }
              },
              {
                term: {
                  'contactNumber.keyword': '07989898989'
                }
              },
              {
                term: {
                  'registrationNumber.keyword': 'BHGUGKJH'
                }
              },
              {
                term: {
                  'gender.keyword': 'male'
                }
              },
              {
                term: {
                  'eventLocationId.keyword': {
                    value: '456',
                    // tslint:disable-next-line
                    boost: 2.0
                  }
                }
              },
              {
                term: {
                  'applicationLocationId.keyword': {
                    value: '123',
                    // tslint:disable-next-line
                    boost: 2.0
                  }
                }
              },
              {
                term: {
                  'createdBy.keyword': {
                    value: 'EMPTY_STRING'
                  }
                }
              },
              {
                term: {
                  'event.keyword': 'EMPTY_STRING'
                }
              },
              {
                terms: {
                  'type.keyword': ['DECLARED']
                }
              },
              {
                terms: {
                  'compositionType.keyword': ['birth-application']
                }
              }
            ],
            should: []
          }
        },
        sort: [{ 'modifiedAt.keyword': 'asc' }]
      }
    })
  })
})
