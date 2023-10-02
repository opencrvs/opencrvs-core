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
import { resolvers } from '@gateway/features/notification/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

describe('Notification root resolvers', () => {
  describe('listNotifications()', () => {
    it('returns an array of composition results', async () => {
      fetch.mockResponseOnce(JSON.stringify({ entry: [{}, {}] }))
      // @ts-ignore
      const compositions = await resolvers.Query.listNotifications(
        {},
        { status: 'preliminary' }
      )

      expect(compositions).toBeDefined()
      expect(compositions).toBeInstanceOf(Array)
      expect(compositions).toHaveLength(2)
    })
  })
  describe('createNotification', () => {
    it('posting the mutation', async () => {
      // @ts-ignore
      const result = await resolvers.Mutation.createNotification(
        {},
        { details: new Date() }
      )

      expect(result).toBeDefined()
    })
  })
})
