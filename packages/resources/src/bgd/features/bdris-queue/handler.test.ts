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
import * as fetchMock from 'jest-fetch-mock'
import QueueItem from '@resources/bgd/features/bdris-queue/model'
import { State } from '@resources/bgd/features/bdris-queue/service'
// tslint:disable-next-line:no-relative-imports
import { testFhirBundle } from './test-data'
import * as generateService from '@resources/bgd/features/generate/service'

let fetch: fetchMock.FetchMock

describe('BDRIS Queue handler tests', () => {
  let server: any

  beforeAll(() => {
    fetch = fetchMock as fetchMock.FetchMock
  })

  beforeEach(async () => {
    fetch.resetMocks()
    jest.resetAllMocks()
    server = await createServer()
  })

  it('triggers validation queue, sends all waiting application and returns a 200', async () => {
    fetch.mockResponses(
      [
        JSON.stringify({ resourceType: 'Practitioner', id: '123' }),
        { status: 200 }
      ],
      [JSON.stringify({}), { status: 200 }] // webhook response
    )

    const setMock = jest.fn()
    const saveMock = jest.fn()

    jest
      .spyOn(QueueItem, 'findOneAndUpdate')
      // @ts-ignore
      .mockReturnValue({
        exec: () => Promise.resolve(null)
      })
      .mockReturnValueOnce({
        exec: () =>
          // @ts-ignore
          Promise.resolve({
            created: new Date(),
            payload: JSON.stringify(testFhirBundle),
            status: State.WAITING_FOR_VALIDATION,
            token: '',
            set: setMock,
            save: saveMock
          })
      })

    jest
      .spyOn(generateService, 'generateRegistrationNumber')
      .mockReturnValue(Promise.resolve('000000'))

    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:resources-user'
    })

    const res = await server.server.inject({
      method: 'GET',
      url: '/bgd/bdris-queue/trigger',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)

    expect(setMock).toBeCalledWith('status', State.VALID)
    expect(saveMock).toBeCalled()

    expect(fetch.mock.calls[1]).toEqual([
      'http://localhost:5050/confirm/registration',
      {
        body: '{"trackingId":"B5WGYJE","registrationNumber":"000000"}',
        method: 'POST',
        headers: expect.anything()
      }
    ])
  })

  it('set status to error and send error confirmation when bundle fails to be converted', async () => {
    fetch.mockResponses(
      [JSON.stringify({}), { status: 200 }] // webhook response
    )

    const setMock = jest.fn()
    const saveMock = jest.fn()

    jest
      .spyOn(QueueItem, 'findOneAndUpdate')
      // @ts-ignore
      .mockReturnValue({
        exec: () => Promise.resolve(null)
      })
      .mockReturnValueOnce({
        exec: () =>
          // @ts-ignore
          Promise.resolve({
            created: new Date(),
            payload: JSON.stringify({ throw: true, ...testFhirBundle }),
            status: State.WAITING_FOR_VALIDATION,
            token: '',
            set: setMock,
            save: saveMock
          })
      })

    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:resources-user'
    })

    const res = await server.server.inject({
      method: 'GET',
      url: '/bgd/bdris-queue/trigger',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)

    expect(setMock).toBeCalledWith('status', State.ERROR)
    expect(setMock).toBeCalledWith(
      'error',
      'Failed to validate with BDRIS: test error'
    )
    expect(saveMock).toBeCalled()

    expect(fetch.mock.calls[0]).toEqual([
      'http://localhost:5050/confirm/registration',
      {
        body: JSON.stringify({
          error: 'Failed to validate with BDRIS: test error'
        }),
        method: 'POST',
        headers: expect.anything()
      }
    ])
  })

  it('set status to error when sending comfirmation fails', async () => {
    fetch.mockRejectOnce(new Error('boom'))

    const setMock = jest.fn()
    const saveMock = jest.fn()

    jest
      .spyOn(QueueItem, 'findOneAndUpdate')
      // @ts-ignore
      .mockReturnValue({
        exec: () => Promise.resolve(null)
      })
      .mockReturnValueOnce({
        exec: () =>
          // @ts-ignore
          Promise.resolve({
            created: new Date(),
            payload: JSON.stringify(testFhirBundle),
            status: State.WAITING_FOR_VALIDATION,
            token: '',
            set: setMock,
            save: saveMock
          })
      })

    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:resources-user'
    })

    const res = await server.server.inject({
      method: 'GET',
      url: '/bgd/bdris-queue/trigger',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)

    expect(setMock).toBeCalledWith('status', State.ERROR)
    expect(setMock).toBeCalledWith(
      'error',
      'Failed to send confirmation: FHIR request failed: boom'
    )
    expect(saveMock).toBeCalled()
  })
})
