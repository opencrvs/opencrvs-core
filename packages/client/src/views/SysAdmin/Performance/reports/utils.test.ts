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
import {
  getValueWithPercentageString,
  getLocationFromPartOfLocationId
} from './utils'
import { mockOfflineData } from '@client/tests/util'

describe('reports utils tests', () => {
  describe('getValueWithPercentage tests', () => {
    it('returns value with percentage string', () => {
      const total = 8
      const value = 3
      const expectedResult = '3 (37%)'

      expect(getValueWithPercentageString(value, total)).toBe(expectedResult)
    })

    it('handles the case when total equals 0', () => {
      const total = 0
      const value = 0
      const expectedResult = '0 (0%)'

      expect(getValueWithPercentageString(value, total)).toBe(expectedResult)
    })
  })
  describe('getLocationFromPartOfLocationId tests', () => {
    it('returns location name for a valid location', () => {
      const offlineResources = mockOfflineData
      const locationId = 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'

      expect(
        getLocationFromPartOfLocationId(locationId, offlineResources)
      ).toEqual({
        id: '65cf62cb-864c-45e3-9c0d-5c70f0074cb4',
        name: 'Barisal',
        alias: 'বরিশাল',
        physicalType: 'Jurisdiction',
        jurisdictionType: 'DIVISION',
        type: 'ADMIN_STRUCTURE',
        partOf: 'Location/0'
      })
    })
    it('returns office name for a valid office', () => {
      const offlineResources = mockOfflineData
      const locationId = 'Location/0d8474da-0361-4d32-979e-af91f012340a'

      expect(
        getLocationFromPartOfLocationId(locationId, offlineResources)
      ).toEqual({
        id: '0d8474da-0361-4d32-979e-af91f012340a',
        name: 'Moktarpur Union Parishad',
        alias: 'মোক্তারপুর ইউনিয়ন পরিষদ',
        physicalType: 'Building',
        type: 'CRVS_OFFICE',
        partOf: 'Location/7a18cb4c-38f3-449f-b3dc-508473d485f3'
      })
    })
    it('returns empty string for an invalid office/location', () => {
      const offlineResources = mockOfflineData
      const locationId = 'Location/0'

      expect(
        getLocationFromPartOfLocationId(locationId, offlineResources)
      ).toEqual({ name: '' })
    })
  })
})
