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
  advancedSearch,
  formatSearchParams
} from '@search/features/search/service'
import { client } from '@search/elasticsearch/client'
import { SortOrder } from '@search/features/search/types'

describe('elasticsearch db helper', () => {
  it('should index a composition with proper configuration', async () => {
    const searchSpy = jest.spyOn(client, 'search')
    await advancedSearch(false, {
      parameters: {
        trackingId: 'dummy',
        contactNumber: 'dummy',
        registrationNumber: 'dummy',
        event: 'birth',
        registrationStatuses: ['DECLARED'],
        compositionType: ['birth-declaration', 'death-declaration'],
        declarationLocationId: ''
      },
      from: 0,
      size: 10
    })
    expect(searchSpy).toBeCalled()
  })

  it('should index a composition with minimum configuration', async () => {
    const searchSpy = jest.spyOn(client, 'search')
    advancedSearch(false, {
      parameters: {
        event: 'birth'
      }
    })
    expect(searchSpy).toBeCalled()
  })

  it('should index a composition and call combination search configuration', async () => {
    const searchSpy = jest.spyOn(client, 'search')
    advancedSearch(false, {
      parameters: {
        trackingId: 'dummy',
        contactNumber: 'dummy',
        registrationNumber: 'dummy',
        event: 'birth',
        registrationStatuses: ['DECLARED'],
        compositionType: ['birth-declaration', 'death-declaration']
      },
      from: 0,
      size: 10
    })
    expect(searchSpy).toBeCalled()
  })
})

describe('elasticsearch params formatter', () => {
  it('should prepare search params to search birth declarations using a single name against all fields', () => {
    const params = formatSearchParams(
      {
        parameters: {
          trackingId: 'myTrackingId',
          contactNumber: '07989898989',
          registrationNumber: 'BHGUGKJH',
          event: 'birth',
          registrationStatuses: ['DECLARED'],
          compositionType: ['birth-declaration'],
          declarationLocationId: '123',
          eventLocationId: '456'
        },
        createdBy: 'EMPTY_STRING',
        from: 0,
        size: 10,
        sort: SortOrder.ASC
      },
      false
    )

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
                match: {
                  event: 'birth'
                }
              },
              {
                query_string: {
                  default_field: 'type',
                  query: '(DECLARED)'
                }
              },
              {
                match: {
                  declarationLocationId: {
                    boost: 2,
                    query: '123'
                  }
                }
              },
              {
                match: {
                  eventLocationId: '456'
                }
              },
              {
                match: {
                  contactNumber: '07989898989'
                }
              },
              {
                match: {
                  registrationNumber: 'BHGUGKJH'
                }
              },
              {
                match: {
                  trackingId: 'myTrackingId'
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
                terms: {
                  'compositionType.keyword': ['birth-declaration']
                }
              }
            ],
            should: []
          }
        },
        sort: [{ dateOfDeclaration: 'asc' }]
      }
    })
  })

  it('should prepare search params to search birth declarations using names against all name fields', () => {
    const params = formatSearchParams(
      {
        parameters: {
          name: 'sadman anik'
        },
        createdBy: '',
        from: 0,
        size: 10,
        sort: SortOrder.ASC
      },
      false
    )

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
                  query: 'sadman anik',
                  fields: [
                    'childFirstNames',
                    'childFamilyName',
                    'motherFirstNames',
                    'motherFamilyName',
                    'fatherFirstNames',
                    'fatherFamilyName',
                    'informantFirstNames',
                    'informantFamilyName',
                    'deceasedFirstNames',
                    'deceasedFamilyName',
                    'spouseFirstNames',
                    'spouseFamilyName',
                    'brideFirstNames',
                    'brideFamilyName',
                    'groomFirstNames',
                    'groomFamilyName',
                    'witnessOneFirstNames',
                    'witnessOneFamilyName',
                    'witnessTwoFirstNames',
                    'witnessTwoFamilyName'
                  ],
                  fuzziness: 'AUTO'
                }
              }
            ],
            should: []
          }
        },
        sort: [{ dateOfDeclaration: 'asc' }]
      }
    })
  })
})
