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
import { createServer } from '@gateway/server'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as fetchAny.FetchMock

describe('get user avatar handler test', () => {
  let server: any
  beforeEach(async () => {
    server = await createServer()
    fetch.resetMocks()
  })
  it('returns a 200 response to client', async () => {
    fetch.mockResponse('ok')
    const res = await server.app.inject({
      method: 'GET',
      url: '/files/avatar/1234.jpg'
    })
    expect(res.statusCode).toBe(200)
  })

  it('returns a 500 response to client if error occured', async () => {
    fetch.mockReject(new Error())
    const res = await server.app.inject({
      method: 'GET',
      url: '/files/avatar/1234.jpg'
    })
    expect(res.statusCode).toBe(500)
  })
})
