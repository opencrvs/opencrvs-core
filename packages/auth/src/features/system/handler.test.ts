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
import * as fetchAny from 'jest-fetch-mock'
import { createServer } from '@auth/index'
//import * as authService from '@auth/features/authenticate/service'

const fetch = fetchAny as fetchAny.FetchMock
describe('authenticate handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  describe('user management service says credentials are not valid', () => {
    it('returns a 401 response to client', async () => {
      fetch.mockReject(new Error())
      const res = await server.server.inject({
        method: 'POST',
        url: '/authenticateSystemClient',
        payload: {
          client_id: '123',
          client_secret: '456'
        }
      })

      expect(res.statusCode).toBe(401)
    })
  })
  /*describe('user management service says credentials are valid', () => {
    it('returns a token to the client', async () => {
      jest
        .spyOn(authService, 'createToken')
        .mockReturnValue(Promise.resolve('789'))
      fetch.mockResponse(
        JSON.stringify({
          systemId: '1',
          status: 'active',
          scope: ['nationalId']
        })
      )
      const res = await server.server.inject({
        method: 'POST',
        url: '/authenticateSystemClient',
        payload: {
          client_id: '123',
          client_secret: '456'
        }
      })

      expect(JSON.parse(res.payload).token).toBe('789')
    })
  })*/
})
