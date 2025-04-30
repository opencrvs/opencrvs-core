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

import { getJurisidictionType } from './utils'

describe('Performance util tests', () => {
  describe('getJurisidictionType tests', () => {
    it('transforms and returns only admin structure data, jurisidiction type if they have', () => {
      const mockLocationData = {
        id: 'd70fbec1-2b26-474b-adbc-bb83783bdf29',
        type: 'ADMIN_STRUCTURE',
        name: 'Ibombo District Office',
        status: 'active',
        partOf: 'Location/ecc5a78b-e7d9-4640-ac65-e591a6a9590f',
        alias: ['Ibombo District Office'],
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
        type: 'CRVS_OFFICE',
        name: 'Ibombo District Office',
        status: 'active',
        partOf: 'Location/ecc5a78b-e7d9-4640-ac65-e591a6a9590f',
        alias: ['Ibombo District Office'],
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
})
