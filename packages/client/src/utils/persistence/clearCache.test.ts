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

import { gql, InMemoryCache } from '@apollo/client'
import {
  clearOldCacheEntries,
  clearUnusedViewRecordCacheEntries
} from './clearCache'

describe('Apollo cache clearing', () => {
  describe('duplicate removal', () => {
    const DUPLICATE_ITEM_RECORD_ID = 'd5a1f06f-eade-4b3d-b203-3bc081b59b90'
    const initialCache = {
      ROOT_QUERY: {
        __typename: 'Query',
        [`fetchRegistration({"id":"${DUPLICATE_ITEM_RECORD_ID}"})`]: {
          __typename: 'BirthRegistration',
          registration: {
            __typename: 'Registration',
            trackingId: 'BRKEYMR'
          }
        },
        [`fetchRegistrationForViewing({"id":"${DUPLICATE_ITEM_RECORD_ID}"})@persist`]:
          {
            __ref: 'BirthRegistration:' + DUPLICATE_ITEM_RECORD_ID
          }
      },
      ['BirthRegistration:' + DUPLICATE_ITEM_RECORD_ID]: {
        __typename: 'BirthRegistration',
        id: DUPLICATE_ITEM_RECORD_ID
      }
    }

    it("doesn't clear cached records that are still being referenced", () => {
      const cache = new InMemoryCache().restore(initialCache)
      clearUnusedViewRecordCacheEntries(cache, [
        {
          id: 'acf0f21c-f62c-11ed-b67e-0242ac120002',
          duplicates: [
            {
              trackingId: 'TEST123',
              compositionId: DUPLICATE_ITEM_RECORD_ID
            }
          ]
        }
      ])
      const query = cache.readQuery({
        query: gql`
          query fetchViewRecordByComposition($id: ID!) {
            fetchRegistrationForViewing(id: $id) @persist {
              id
            }
          }
        `,
        variables: {
          id: 'd5a1f06f-eade-4b3d-b203-3bc081b59b90'
        }
      })

      expect(query).toHaveProperty('fetchRegistrationForViewing')
    })

    it("clears cached records that aren't referenced", () => {
      const cache = new InMemoryCache().restore(initialCache)
      clearUnusedViewRecordCacheEntries(cache, [
        {
          id: 'acf0f21c-f62c-11ed-b67e-0242ac120002',
          duplicates: [] // Now the duplicate in cache is not referenced by any composition
        }
      ])

      const query = cache.readQuery({
        query: gql`
          query fetchViewRecordByComposition($id: ID!) {
            fetchRegistrationForViewing(id: $id) @persist {
              id
            }
          }
        `,
        variables: {
          id: 'd5a1f06f-eade-4b3d-b203-3bc081b59b90'
        }
      })

      expect(query).toBeNull()
    })
  })

  // Based on requirements in OCRVS-5151, e.g. when we get to the May 2023, we clear out March 2022 and older values
  describe('old items removal', () => {
    it('clears items from cache having timeStart in March 2022', () => {
      const currentDate = new Date('2023-05-01T00:00:01')
      const timeStart = '2022-03-31T06:00:00.000Z'
      const initialCache = {
        ROOT_QUERY: {
          __typename: 'Query',
          [`getTotalMetrics({"event":"BIRTH","locationId":"8d2a4985-da90-423b-a7ab-9a0e43f70a71","timeEnd":"2022-05-31T06:00:00.000Z","timeStart":"${timeStart}"})@persist`]:
            { __typename: 'TotalMetricsResult', results: [] }
        }
      }
      const cache = new InMemoryCache().restore(initialCache)

      const queryParams = {
        query: gql`
          query getTotalMetrics(
            $event: String!
            $timeStart: String!
            $timeEnd: String!
            $locationId: String
          ) {
            getTotalMetrics(
              timeStart: $timeStart
              timeEnd: $timeEnd
              locationId: $locationId
              event: $event
            ) @persist {
              results
            }
          }
        `,
        variables: {
          event: 'BIRTH',
          locationId: '8d2a4985-da90-423b-a7ab-9a0e43f70a71',
          timeEnd: '2022-05-31T06:00:00.000Z',
          timeStart
        }
      }
      let query = cache.readQuery(queryParams)
      expect(query).toHaveProperty('getTotalMetrics')

      clearOldCacheEntries(cache, currentDate)

      query = cache.readQuery(queryParams)
      expect(query).toBeNull()
    })

    it("doesn't clear items from cache having timeStart in April 2022", () => {
      const currentDate = new Date('2023-05-01T00:00:01')
      const timeStart = '2022-04-01T06:00:00.000Z'

      const initialCache = {
        ROOT_QUERY: {
          __typename: 'Query',
          [`getTotalMetrics({"event":"BIRTH","locationId":"8d2a4985-da90-423b-a7ab-9a0e43f70a71","timeEnd":"2023-04-01T06:00:00.000Z","timeStart":"${timeStart}"})@persist`]:
            { __typename: 'TotalMetricsResult', results: [] }
        }
      }
      const cache = new InMemoryCache().restore(initialCache)

      const queryParams = {
        query: gql`
          query getTotalMetrics(
            $event: String!
            $timeStart: String!
            $timeEnd: String!
            $locationId: String
          ) {
            getTotalMetrics(
              timeStart: $timeStart
              timeEnd: $timeEnd
              locationId: $locationId
              event: $event
            ) @persist {
              results
            }
          }
        `,
        variables: {
          event: 'BIRTH',
          locationId: '8d2a4985-da90-423b-a7ab-9a0e43f70a71',
          timeEnd: '2023-04-01T06:00:00.000Z',
          timeStart
        }
      }
      let query = cache.readQuery(queryParams)
      expect(query).toHaveProperty('getTotalMetrics')

      clearOldCacheEntries(cache, currentDate)

      query = cache.readQuery(queryParams)
      expect(query).toHaveProperty('getTotalMetrics')
    })
  })
})
