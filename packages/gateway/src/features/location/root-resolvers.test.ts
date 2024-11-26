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
import {
  savedAdministrativeLocation,
  savedLocation
} from '@opencrvs/commons/fixtures'
import { resolvers } from '@gateway/features/location/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'
import { UUID } from '@opencrvs/commons'

const fetch = fetchAny as any

describe('Location root resolvers', () => {
  describe('isLeafLevelLocation', () => {
    it('returns false if a location has administrative locations as its children', async () => {
      fetch.mockResponseOnce(
        JSON.stringify([
          savedAdministrativeLocation({
            partOf: { reference: 'Location/1' as `Location/${UUID}` }
          })
        ])
      )
      // @ts-ignore
      const isLeafLevelLocation = await resolvers.Query!.isLeafLevelLocation(
        {},
        { locationId: '1' },
        { headers: undefined }
      )
      expect(isLeafLevelLocation).toBe(false)
    })

    it('returns true if a location has no administrative locations as its children', async () => {
      fetch.mockResponseOnce(
        JSON.stringify([
          savedLocation({
            partOf: { reference: 'Location/1' as `Location/${UUID}` }
          }),
          savedAdministrativeLocation({
            partOf: { reference: 'Location/2' as `Location/${UUID}` }
          })
        ])
      )
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
