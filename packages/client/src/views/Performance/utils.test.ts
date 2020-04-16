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

import { transformChildLocations } from './utils'
import { GQLLocationType } from '@opencrvs/gateway/src/graphql/schema'

describe('Performance util tests', () => {
  describe('transformChildLocations tests', () => {
    it('transforms and returns only admin structure data, jurisidiction type if they have', () => {
      const mockResponseData = [
        {
          id: 'd70fbec1-2b26-474b-adbc-bb83783bdf29',
          type: 'ADMIN_STRUCTURE' as GQLLocationType,
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'UNION'
            }
          ]
        },
        {
          id: '78e264aa-e493-430e-9314-594641c5703f',
          type: 'ADMIN_STRUCTURE' as GQLLocationType,
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'UNION'
            }
          ]
        }
      ]

      const expectedValue = {
        childLocations: mockResponseData,
        jurisdictionType: 'UNION'
      }
      expect(transformChildLocations(mockResponseData)).toEqual(expectedValue)
    })

    it('returns empty data when no admin structure in child locations', () => {
      const mockFacilitiesData = [
        {
          id: 'e7fa94ba-5582-48f9-ba43-cf41d88253c6',
          type: 'CRVS_OFFICE' as GQLLocationType,
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/internal-id',
              value: 'CRVS_FACILITY000002356'
            }
          ]
        }
      ]

      const expectedValue = {
        childLocations: []
      }
      expect(transformChildLocations(mockFacilitiesData)).toEqual(expectedValue)
    })
  })
})
