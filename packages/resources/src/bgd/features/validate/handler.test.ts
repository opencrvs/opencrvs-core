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
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { createServer } from '@resources/index'
// tslint:disable-next-line:no-relative-imports
import { testFhirBundle } from './test-data'
import * as fetchMock from 'jest-fetch-mock'
import * as generateService from '@resources/bgd/features/generate/service'

let fetch: fetchMock.FetchMock

describe('administrative handler receives a request', () => {
  let server: any

  beforeAll(() => {
    fetch = fetchMock as fetchMock.FetchMock
  })

  beforeEach(async () => {
    fetch.resetMocks()
    server = await createServer()
  })

  describe('Validation handler tests', () => {
    it('return a 202 and calls callback webhook', async () => {
      fetch.mockResponses(
        [
          JSON.stringify({ resourceType: 'Practitioner', id: '123' }),
          { status: 200 }
        ],
        [JSON.stringify({}), { status: 200 }] // webhook response
      )

      jest
        .spyOn(generateService, 'generateRegistrationNumber')
        .mockReturnValue(Promise.resolve('000000'))

      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:resources-user'
      })

      const res = await server.server.inject({
        method: 'POST',
        url: '/bgd/validate/registration',
        headers: {
          Authorization: `Bearer ${token}`
        },
        payload: testFhirBundle
      })

      expect(res.statusCode).toBe(202)

      expect(fetch.mock.calls[1]).toEqual([
        'http://localhost:5050/confirm/registration',
        {
          body: '{"trackingId":"B5WGYJE","registrationNumber":"000000"}',
          method: 'POST',
          headers: expect.anything()
        }
      ])
    })
  })
})
