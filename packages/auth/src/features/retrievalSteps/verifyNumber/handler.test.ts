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
import { createServer } from '@auth/server'
import * as codeService from '@auth/features/verifyCode/service'
import * as retrievalService from '@auth/features/retrievalSteps/verifyUser/service'
import * as fetchAny from 'jest-fetch-mock'
const fetch = fetchAny as fetchAny.FetchMock

describe('verifyNumber handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('Verifies the code for a valid nonce and returns a security question key', async () => {
    jest.spyOn(codeService, 'generateNonce').mockReturnValue('12345')
    fetch.mockResponse(
      JSON.stringify({
        userId: '1',
        username: 'fake_user_name',
        status: 'active',
        scope: ['demo'],
        mobile: '+8801711111111',
        securityQuestionKey: 'dummyKey'
      })
    )
    const stepOneRes = await server.server.inject({
      method: 'POST',
      url: '/verifyUser',
      payload: { mobile: '+8801711111111', retrieveFlow: 'password' }
    })

    const res = await server.server.inject({
      method: 'POST',
      url: '/verifyNumber',
      payload: { nonce: stepOneRes.result.nonce, code: '000000' }
    })
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.payload).nonce).toBe(stepOneRes.result.nonce)
    expect(JSON.parse(res.payload).securityQuestionKey).toBe('dummyKey')
  })
  it('throws error for an invalid nonce', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/verifyNumber',
      payload: { nonce: 'invalid', code: '000000' }
    })
    expect(res.statusCode).toBe(401)
  })
  it('throws error for invalid retrieval status', async () => {
    jest
      .spyOn(retrievalService, 'getRetrievalStepInformation')
      .mockResolvedValueOnce({
        userFullName: [
          {
            use: 'en',
            family: 'Anik',
            given: ['Sadman']
          }
        ],
        userId: '123',
        username: 'fake_user_name',
        mobile: '+8801711111111',
        status: 'NUMBER_VERIFIED' as retrievalService.RetrievalSteps,
        securityQuestionKey: 'dummyKey',
        scope: [],
        practitionerId: ''
      })
    const res = await server.server.inject({
      method: 'POST',
      url: '/verifyNumber',
      payload: { nonce: 'dummy', code: '000000' }
    })
    expect(res.statusCode).toBe(401)
  })
})
