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
import { logger } from '@auth/logger'

const fetch = fetchAny as fetchAny.FetchMock

describe('username reminder', () => {
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
      practitionerId: 'bf2b13cb-77e7-42b8-b2c3-22a2623eadcf'
    })
  })

  describe('when a valid request is made', () => {
    it('returns OK', async () => {
      const res = await server.server.inject({
        method: 'POST',
        url: '/sendUserName',
        payload: {
          nonce: '12345'
        }
      })

      expect(res.statusCode).toBe(200)
    })
    it('calls notification service to send the username', async () => {
      const spy = jest.spyOn(logger, 'info')
      await server.server.inject({
        method: 'POST',
        url: '/sendUserName',
        payload: {
          nonce: '12345'
        }
      })

      expect(spy.mock.calls).toHaveLength(1)
    })
  })
  describe('when an invalid nonce is supplied', () => {
    it('responds with an error', async () => {
      const res = await server.server.inject({
        method: 'POST',
        url: '/sendUserName',
        payload: {
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
          practitionerId: 'bf2b13cb-77e7-42b8-b2c3-22a2623eadcf'
        }
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/sendUserName',
        payload: {
          nonce: '12345'
        }
      })

      expect(res.statusCode).toBe(401)
    })
  })
})
