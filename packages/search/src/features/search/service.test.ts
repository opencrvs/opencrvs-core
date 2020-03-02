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
import { searchComposition } from '@search/features/search/service'
import { client } from '@search/elasticsearch/client'

describe('elasticsearch db helper', () => {
  it('should index a composition with proper configuration', async () => {
    const searchSpy = jest.spyOn(client, 'search')
    const searchQuery = {
      query: 'some query',
      trackingId: 'dummy',
      contactNumber: 'dummy',
      registrationNumber: 'dummy',
      name: 'some name',
      event: 'EMPTY_STRING',
      status: ['DECLARED'],
      type: ['birth-application', 'death-application'],
      applicationLocationId: 'EMPTY_STRING',
      from: 0,
      size: 10
    }
    searchComposition(searchQuery)
    expect(searchSpy).toBeCalled()
    expect(searchSpy).toBeCalledWith(
      expect.objectContaining({
        type: 'compositions',
        from: 0,
        size: 10,
        body: {
          sort: [{ dateOfApplication: 'asc' }],
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
          }
        }
      })
    )
  })

  it('should index a composition with minimum configuration', async () => {
    const searchSpy = jest.spyOn(client, 'search')
    searchComposition({})
    expect(searchSpy).toBeCalled()
  })
})
