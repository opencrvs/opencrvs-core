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
import { queryBuilder, selectNameFields } from '@search/features/search/utils'

describe('elasticsearch db helper', () => {
  it('should create a query that searches all name fields', () => {
    const newQuery = queryBuilder(
      'some query',
      'dummy',
      'dummy',
      'dummy',
      'some name',
      selectNameFields('EMPTY_STRING'),
      'EMPTY_STRING',
      'EMPTY_STRING',
      {
        event: 'EMPTY_STRING',
        status: ['DECLARED'],
        type: ['birth-application', 'death-application']
      }
    )
    expect(newQuery).toEqual({
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
              query: 'some name',
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
              'trackingId.keyword': 'dummy'
            }
          },
          {
            term: {
              'contactNumber.keyword': 'dummy'
            }
          },
          {
            term: {
              'registrationNumber.keyword': 'dummy'
            }
          },
          {
            term: {
              'applicationLocationId.keyword': {
                value: 'EMPTY_STRING',
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
              'compositionType.keyword': [
                'birth-application',
                'death-application'
              ]
            }
          }
        ],
        should: []
      }
    })
  })

  it('should create a query that searches only child name fields', () => {
    const newQuery = queryBuilder(
      'some query',
      'dummy',
      'dummy',
      'dummy',
      'some name',
      selectNameFields('CHILD'),
      'EMPTY_STRING',
      'EMPTY_STRING',
      {
        event: 'EMPTY_STRING',
        status: ['DECLARED'],
        type: ['birth-application', 'death-application']
      }
    )
    expect(newQuery).toEqual({
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
              query: 'some name',
              fields: [
                'childFirstNames',
                'childFamilyName',
                'childFirstNamesLocal',
                'childFamilyNameLocal'
              ],
              fuzziness: 'AUTO'
            }
          },
          {
            term: {
              'trackingId.keyword': 'dummy'
            }
          },
          {
            term: {
              'contactNumber.keyword': 'dummy'
            }
          },
          {
            term: {
              'registrationNumber.keyword': 'dummy'
            }
          },
          {
            term: {
              'applicationLocationId.keyword': {
                value: 'EMPTY_STRING',
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
              'compositionType.keyword': [
                'birth-application',
                'death-application'
              ]
            }
          }
        ],
        should: []
      }
    })
  })
})
