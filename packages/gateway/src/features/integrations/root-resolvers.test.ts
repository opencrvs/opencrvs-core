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

import { resolvers } from '@gateway/features/user/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

beforeEach(() => {
  fetch.resetMocks()
})

describe('Integration root resolvers', () => {
  describe('fetchIntegration()', () => {
    it('returns a client object', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          clientId: '25d11fa6-bb7b-4cf3-925c-a38c042b9b21',
          name: 'Emmanuel Mayuka',
          sha_secret: '4c5e02ba-cb73-40c1-8f48-92e81bd7e0d8'
        })
      )

      const integration = await resolvers.Query.fetchIntegration(
        {},
        { Ids: '25d11fa6-bb7b-4cf3-925c-a38c042b9b21' }
      )

      expect(integration).toBeDefined()
    })
  })
})
