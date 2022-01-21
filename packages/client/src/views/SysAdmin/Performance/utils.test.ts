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

import { getJurisidictionType, isUnderJurisdictionOfUser } from './utils'
import { GQLLocationType } from '@opencrvs/gateway/src/graphql/schema'
import { mockOfflineData } from '@client/tests/util'

describe('Performance util tests', () => {
  describe('getJurisidictionType tests', () => {
    it('transforms and returns only admin structure data, jurisidiction type if they have', () => {
      const mockLocationData = {
        id: 'd70fbec1-2b26-474b-adbc-bb83783bdf29',
        type: 'ADMIN_STRUCTURE' as GQLLocationType,
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'UNION'
          }
        ]
      }

      expect(getJurisidictionType(mockLocationData)).toEqual('UNION')
    })

    it('returns null when child location is not admin structure', () => {
      const mockFacilitiesData = {
        id: 'e7fa94ba-5582-48f9-ba43-cf41d88253c6',
        type: 'CRVS_OFFICE' as GQLLocationType,
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/internal-id',
            value: 'CRVS_FACILITY000002356'
          }
        ]
      }

      expect(getJurisidictionType(mockFacilitiesData)).toEqual(null)
    })
  })

  describe('isUnderJurisdictionOfUser', () => {
    it('returns true if given location is a child location of jurisdictionLocation', () => {
      const locations = mockOfflineData.locations
      const locationId = 'a3455e64-164c-4bf4-b834-16640a85efd8' //Cox's Bazaar District
      const jurisdictionLocation = '8cbc862a-b817-4c29-a490-4a8767ff023c' //Chittagong Division

      expect(
        isUnderJurisdictionOfUser(locations, locationId, jurisdictionLocation)
      ).toEqual(true)
    })

    it('returns false if given location is not a child location of jurisdictionLocation', () => {
      const locations = mockOfflineData.locations
      const locationId = 'a3455e64-164c-4bf4-b834-16640a85efd8' //Cox's Bazaar District
      const jurisdictionLocation = '65cf62cb-864c-45e3-9c0d-5c70f0074cb4' //Barisal Division

      expect(
        isUnderJurisdictionOfUser(locations, locationId, jurisdictionLocation)
      ).toEqual(false)
    })
  })
})
