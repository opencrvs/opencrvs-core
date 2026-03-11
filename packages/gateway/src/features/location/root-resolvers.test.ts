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
import { resolvers } from '@gateway/features/location/root-resolvers'
import { fetchAllLocations } from '@gateway/location'

jest.mock('@gateway/location', () => ({
  fetchAllLocations: jest.fn()
}))

describe('Location root resolvers', () => {
  describe('isLeafLevelLocation', () => {
    it('returns false if a location has administrative locations as its children', async () => {
      ;(fetchAllLocations as jest.Mock).mockResolvedValueOnce([
        {
          id: 'child-location-id',
          name: 'Child Location',
          locationType: 'ADMIN_STRUCTURE',
          administrativeAreaId: '1',
          validUntil: null
        }
      ])
      // @ts-ignore
      const isLeafLevelLocation = await resolvers.Query!.isLeafLevelLocation(
        {},
        { locationId: '1' },
        { headers: undefined }
      )
      expect(isLeafLevelLocation).toBe(false)
    })

    it('returns true if a location has no administrative locations as its children', async () => {
      ;(fetchAllLocations as jest.Mock).mockResolvedValueOnce([
        {
          id: 'other-location-id',
          name: 'Other Location',
          locationType: 'ADMIN_STRUCTURE',
          administrativeAreaId: '2',
          validUntil: null
        }
      ])
      // @ts-ignore
      const isLeafLevelLocation = await resolvers.Query!.isLeafLevelLocation(
        {},
        { locationId: '1' },
        { headers: undefined }
      )
      expect(isLeafLevelLocation).toBe(true)
    })
  })
})
