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
import { queryBuilder } from '@search/features/search/utils'

describe('elasticsearch db helper', () => {
  it('should create a query that searches child and mother name fields and event location', () => {
    const newQuery = queryBuilder(
      '',
      'trackingId',
      'contactNumber',
      'registrationNumber',
      'eventLocationId',
      'gender',
      [
        {
          name: 'child name',
          fields: 'CHILD_FIRST'
        },
        {
          name: 'mother name',
          fields: 'MOTHER_FIRST'
        }
      ],
      'declarationLocationId',
      'declarationLocationHirarchyId',
      'createdBy',
      {
        event: 'EMPTY_STRING',
        status: ['DECLARED'],
        type: ['birth-declaration', 'death-declaration']
      }
    )
    expect(newQuery).toEqual({
      bool: {
        must: [
          {
            multi_match: {
              query: 'child name',
              fields: ['childFirstNames', 'childFirstNamesLocal'],
              fuzziness: 'AUTO'
            }
          },
          {
            multi_match: {
              query: 'mother name',
              fields: ['motherFirstNames', 'motherFirstNamesLocal'],
              fuzziness: 'AUTO'
            }
          },
          {
            term: {
              'trackingId.keyword': 'trackingId'
            }
          },
          {
            term: {
              'contactNumber.keyword': 'contactNumber'
            }
          },
          {
            term: {
              'registrationNumber.keyword': 'registrationNumber'
            }
          },
          {
            term: {
              'gender.keyword': 'gender'
            }
          },
          {
            term: {
              'eventLocationId.keyword': {
                value: 'eventLocationId',
                // tslint:disable-next-line
                boost: 2.0
              }
            }
          },
          {
            term: {
              'declarationLocationId.keyword': {
                value: 'declarationLocationId',
                // tslint:disable-next-line
                boost: 2.0
              }
            }
          },
          {
            term: {
              'declarationLocationHirarchyIds.keyword': {
                value: 'declarationLocationHirarchyId',
                // tslint:disable-next-line
                boost: 2.0
              }
            }
          },
          {
            term: {
              'createdBy.keyword': {
                value: 'createdBy'
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
                'birth-declaration',
                'death-declaration'
              ]
            }
          }
        ],
        should: []
      }
    })
  })
})
