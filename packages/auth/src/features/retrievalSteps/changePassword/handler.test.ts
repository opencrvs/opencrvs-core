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
import * as fetchAny from 'jest-fetch-mock'
import { createServer } from '@auth/server'
import {
  storeRetrievalStepInformation,
  RetrievalSteps
} from '@auth/features/retrievalSteps/verifyUser/service'

const fetch = fetchAny as fetchAny.FetchMock

describe('password change', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
    fetch.resetMocks()
    fetch.mockResponse('OK')
    storeRetrievalStepInformation('12345', RetrievalSteps.SECURITY_Q_VERIFIED, {
      userFullName: [
        {
          use: 'en',
          family: 'Anik',
          given: ['Sadman']
        }
      ],
      userId: '123',
      username: 'fake_user_name',
      mobile: '123123123',
      securityQuestionKey: 'TEST_SECURITY_QUESTION_KEY',
      scope: [],
      practitionerId: ''
    })
  })

  describe('when a valid request is made', () => {
    it('returns OK', async () => {
      const res = await server.server.inject({
        method: 'POST',
        url: '/changePassword',
        payload: {
          newPassword: 'newpass',
          nonce: '12345'
        }
      })

      expect(res.statusCode).toBe(200)
    })
    it('calls user-management service to change the password', async () => {
      await server.server.inject({
        method: 'POST',
        url: '/changePassword',
        payload: {
          newPassword: 'newpass',
          nonce: '12345'
        }
      })

      expect(fetch.mock.calls).toHaveLength(1)
    })
  })
  describe('when an invalid nonce is supplied', () => {
    it('responds with an error', async () => {
      const res = await server.server.inject({
        method: 'POST',
        url: '/changePassword',
        payload: {
          newPassword: 'newpass',
          nonce: '54332'
        }
      })

      expect(res.statusCode).toBe(401)
    })
  })
  describe('when invalid status found on retrieval step data', () => {
    it('responds with an error', async () => {
      await storeRetrievalStepInformation(
        '12345',
        RetrievalSteps.NUMBER_VERIFIED,
        {
          userFullName: [
            {
              use: 'en',
              family: 'Anik',
              given: ['Sadman']
            }
          ],
          userId: '123',
          username: 'fake_user_name',
          mobile: '123123123',
          securityQuestionKey: 'TEST_SECURITY_QUESTION_KEY',
          scope: [],
          practitionerId: ''
        }
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/changePassword',
        payload: {
          newPassword: 'newpass',
          nonce: '12345'
        }
      })

      expect(res.statusCode).toBe(401)
    })
  })
})
