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
import {
  testFhirBundle,
  testFhirBundleNoTaskExtension,
  testFhirBundleNoTaskResource
} from './test-data'
import * as fetchMock from 'jest-fetch-mock'
import * as generateService from '@resources/bgd/features/generate/service'
import * as queueItemModel from '@resources/bgd/features/bdris-queue/model'
import * as constants from '@resources/constants'

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
    it('returns a 202 and calls callback webhook', async () => {
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

    it('returns a 202 but calls callback webhook with an error - no task resource', async () => {
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
        payload: testFhirBundleNoTaskResource
      })

      expect(res.statusCode).toBe(202)

      expect(fetch.mock.calls[0]).toEqual([
        'http://localhost:5050/confirm/registration',
        {
          body:
            '{"error":"Failed to validate registration: could not find task resource in bundle or task resource had no extensions"}',
          method: 'POST',
          headers: expect.anything()
        }
      ])
    })

    it('returns a 202 but calls callback webhook with an error - no extensions in task', async () => {
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
        payload: testFhirBundleNoTaskExtension
      })

      expect(res.statusCode).toBe(202)

      expect(fetch.mock.calls[0]).toEqual([
        'http://localhost:5050/confirm/registration',
        {
          body:
            '{"error":"Failed to validate registration: practitioner reference not found in task resource"}',
          method: 'POST',
          headers: expect.anything()
        }
      ])
    })

    it('add application to queue when config set to validate with BDRIS', async () => {
      // @ts-ignore
      constants.VALIDATE_IN_BDRIS2 = 'true'

      const saveMock = jest.fn()
      // @ts-ignore
      jest.spyOn(queueItemModel, 'default').mockImplementation(() => ({
        save: saveMock
      }))

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
        payload: testFhirBundleNoTaskExtension
      })

      expect(res.statusCode).toBe(202)
      expect(saveMock).toBeCalled()

      // reset constant
      // @ts-ignore
      constants.VALIDATE_IN_BDRIS2 = 'false'
    })
  })
})
