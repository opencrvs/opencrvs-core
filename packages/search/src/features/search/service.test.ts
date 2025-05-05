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
import * as esClient from '@search/elasticsearch/client'
import { SortOrder } from '@search/features/search/types'
import { UUID } from '@opencrvs/commons'

describe('Search service', () => {
  it('should index a composition with proper configuration', async () => {
    const searchMock = jest.fn()
    jest.spyOn(esClient, 'getOrCreateClient').mockReturnValue({
      search: searchMock
    } as any)

    await advancedSearch(false, {
      parameters: {
        trackingId: 'dummy',
        contactNumber: 'dummy',
        registrationNumber: 'dummy',
        event: [{ eventName: 'birth' }],
        registrationStatuses: ['DECLARED'],
        compositionType: ['birth-declaration', 'death-declaration'],
        declarationLocationId: '00000000-0000-0000-0000-000000000001' as UUID
      },
      from: 0,
      size: 10
    })
    expect(searchMock).toBeCalled()
  })

  it('should index a composition with minimum configuration', async () => {
    const searchMock = jest.fn()
    jest.spyOn(esClient, 'getOrCreateClient').mockReturnValue({
      search: searchMock
    } as any)

    await advancedSearch(false, {
      parameters: {
        event: [{ eventName: 'birth' }]
      }
    })

    expect(searchMock).toBeCalled()
  })

  it('should index a composition and call combination search configuration', async () => {
    const searchMock = jest.fn()
    jest.spyOn(esClient, 'getOrCreateClient').mockReturnValue({
      search: searchMock
    } as any)

    await advancedSearch(false, {
      parameters: {
        trackingId: 'dummy',
        contactNumber: 'dummy',
        registrationNumber: 'dummy',
        event: [{ eventName: 'birth' }],
        registrationStatuses: ['DECLARED'],
        compositionType: ['birth-declaration', 'death-declaration']
      },
      from: 0,
      size: 10
    })
    expect(searchMock).toBeCalled()
  })
})

describe('elasticsearch params formatter', () => {
  it('should prepare search params to search birth declarations using a single name against all fields', async () => {
    const params = await formatSearchParams(
      {
        parameters: {
          trackingId: 'myTrackingId',
          contactNumber: '07989898989',
          registrationNumber: 'BHGUGKJH',
          event: [{ eventName: 'birth' }],
          registrationStatuses: ['DECLARED'],
          compositionType: ['birth-declaration'],
          declarationLocationId: '00000000-0000-0000-0000-000000000002' as UUID,
          eventLocationId: '00000000-0000-0000-0000-000000000003' as UUID
        },
        createdBy: 'EMPTY_STRING',
        from: 0,
        size: 10,
        sortColumn: 'dateOfDeclaration',
        sort: SortOrder.ASC
      },
      false
    )

    expect(params).toEqual({
      from: 0,
      index: 'ocrvs',
      size: 10,
      query: {
        bool: {
          filter: [
            {
              bool: {
                should: [
                  {
                    term: { 'event.keyword': 'birth' }
                  }
                ]
              }
            }
          ],
          must: [
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
                  query: '00000000-0000-0000-0000-000000000002'
                }
              }
            },
            {
              match: {
                eventLocationId: '00000000-0000-0000-0000-000000000003'
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
          ]
        }
      },
      sort: [{ dateOfDeclaration: { order: 'asc', unmapped_type: 'keyword' } }]
    })
  })

  it('should prepare search params to search birth declarations using names against all name fields', async () => {
    const params = await formatSearchParams(
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
      from: 0,
      index: 'ocrvs',
      size: 10,
      query: {
        bool: {
          filter: [],
          must: [
            {
              bool: {
                should: [
                  {
                    bool: {
                      filter: { term: { event: 'birth' } },
                      must: {
                        multi_match: {
                          query: 'sadman anik',
                          fields: [
                            'name^3',
                            'childFirstNames^2',
                            'childFamilyName',
                            'informantFirstNames',
                            'informantFamilyName',
                            'motherFirstNames',
                            'motherFamilyName',
                            'fatherFirstNames',
                            'fatherFamilyName'
                          ],
                          fuzziness: 'AUTO'
                        }
                      }
                    }
                  },
                  {
                    bool: {
                      filter: { term: { event: 'death' } },
                      must: {
                        multi_match: {
                          query: 'sadman anik',
                          fields: [
                            'name^3',
                            'deceasedFirstNames^2',
                            'deceasedFamilyName',
                            'informantFirstNames',
                            'informantFamilyName',
                            'spouseFirstNames',
                            'spouseFamilyName'
                          ],
                          fuzziness: 'AUTO'
                        }
                      }
                    }
                  },
                  {
                    bool: {
                      filter: { term: { event: 'marriage' } },
                      must: {
                        multi_match: {
                          query: 'sadman anik',
                          fields: [
                            'brideFirstNames^6',
                            'brideFamilyName^6',
                            'groomFirstNames^6',
                            'groomFamilyName^6',
                            'witnessOneFirstNames',
                            'witnessOneFamilyName',
                            'witnessTwoFirstNames',
                            'witnessTwoFamilyName'
                          ],
                          type: 'cross_fields',
                          operator: 'and'
                        }
                      }
                    }
                  }
                ],
                minimum_should_match: 1
              }
            }
          ]
        }
      },
      sort: []
    })
  })
})
