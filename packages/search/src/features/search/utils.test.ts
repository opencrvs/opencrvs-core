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
import { advancedQueryBuilder } from '@search/features/search/utils'

describe('elasticsearch db helper', () => {
  it('should create a query that searches child and mother name fields and event location', async () => {
    const newQuery = await advancedQueryBuilder(
      {
        event: [{ eventName: 'birth' }],
        compositionType: ['birth-declaration', 'death-declaration']
      },
      '',
      false
    )
    expect(newQuery).toEqual({
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
            terms: {
              'compositionType.keyword': [
                'birth-declaration',
                'death-declaration'
              ]
            }
          }
        ]
      }
    })
  })
  it('should create a query that searches by name', async () => {
    const newQuery = await advancedQueryBuilder(
      {
        trackingId: '',
        nationalId: '',
        registrationNumber: '',
        contactNumber: '',
        contactEmail: '',
        name: 'John Doe'
      },
      '',
      false
    )
    expect(newQuery).toEqual({
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
                        query: 'John Doe',
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
                        query: 'John Doe',
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
                        query: 'John Doe',
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
    })
  })
})
