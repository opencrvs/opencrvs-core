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
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

describe('Location root resolvers', () => {
  describe('locationsByParent()', () => {
    it('returns an array of location results', async () => {
      fetch.mockResponseOnce(JSON.stringify({ entry: [{}, {}] }))
      // @ts-ignore
      const compositions = await resolvers.Query.locationsByParent(
        {},
        { parentId: '1' },
        { headers: undefined }
      )

      expect(compositions).toBeDefined()
      expect(compositions).toBeInstanceOf(Array)
      expect(compositions).toHaveLength(2)
    })
  })
  describe('locationById()', () => {
    it('returns a location object', async () => {
      fetch.mockResponseOnce(JSON.stringify({ resourceType: 'Location' }))
      // @ts-ignore
      const composition = await resolvers.Query.locationById(
        {},
        { locationId: '1' },
        { headers: undefined }
      )

      expect(composition).toBeDefined()
    })
  })
  describe('hasChildLocation()', () => {
    it('returns a location object if found', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          entry: [
            {
              resource: {}
            }
          ]
        })
      )
      // @ts-ignore
      const composition = await resolvers.Query.hasChildLocation(
        {},
        { parentId: '1' },
        { headers: undefined }
      )

      expect(composition).toBeDefined()
    })
  })
})
