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

import { createServer } from '@config/server'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as fetchAny.FetchMock

describe('Route checking', () => {
  let server: any
  beforeEach(async () => {
    server = await createServer()
    fetch.resetMocks()
  })
  it('Ping check', async () => {
    fetch.mockResponse(
      JSON.stringify({
        success: true
      })
    )
    const res = await server.server.inject({
      method: 'GET',
      url: '/ping'
    })
    expect(res.statusCode).toBe(200)
  })
})
