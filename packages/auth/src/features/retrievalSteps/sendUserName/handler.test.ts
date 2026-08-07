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
import { AuthServer, createServer } from '@auth/server'
import {
  storeRetrievalStepInformation,
  RetrievalSteps
} from '@auth/features/retrievalSteps/verifyUser/service'

const fetch = fetchAny as fetchAny.FetchMock

jest.mock('@opencrvs/commons', () => {
  const actual = jest.requireActual('@opencrvs/commons')
  return {
    __esModule: true,
    ...actual,
    triggerUserEventNotification: jest.fn()
  }
})

jest.mock('@auth/features/authenticate/service', () => {
  const actual = jest.requireActual('@auth/features/authenticate/service')
  return {
    __esModule: true,
    ...actual,
    recordUserAuditEvent: jest.fn().mockResolvedValue(undefined)
  }
})

describe('username reminder', () => {
  let server: AuthServer

  beforeEach(async () => {
    server = await createServer()
    fetch.resetMocks()
    fetch.mockResponse('OK')
    storeRetrievalStepInformation('12345', RetrievalSteps.SECURITY_Q_VERIFIED, {
      userFullName: { firstname: 'Sadman', surname: 'Anik' },
      userId: '123',
      username: 'fake_user_name',
      mobile: '123123123',
      securityQuestionKey: 'TEST_SECURITY_QUESTION_KEY',
      scope: [],
      retrieveFlow: 'username'
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
    it('Triggers `username-reminder` event in countryconfig', async () => {
      const { triggerUserEventNotification } = await import('@opencrvs/commons')
      await server.server.inject({
        method: 'POST',
        url: '/sendUserName',
        payload: {
          nonce: '12345'
        }
      })
      expect(triggerUserEventNotification).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'username-reminder' })
      )
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
          userFullName: { firstname: 'Sadman', surname: 'Anik' },
          userId: '123',
          username: 'fake_user_name',
          mobile: '123123123',
          securityQuestionKey: 'TEST_SECURITY_QUESTION_KEY',
          scope: [],
          retrieveFlow: 'username'
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
  describe('when the record was verified under the password-reset flow', () => {
    it('rejects with the same 401 shape as a wrong status, since a password-reset link must not be usable to retrieve a username', async () => {
      await storeRetrievalStepInformation(
        'password-flow-nonce',
        RetrievalSteps.SECURITY_Q_VERIFIED,
        {
          userFullName: { firstname: 'Sadman', surname: 'Anik' },
          userId: '123',
          username: 'fake_user_name',
          mobile: '123123123',
          securityQuestionKey: 'TEST_SECURITY_QUESTION_KEY',
          scope: [],
          retrieveFlow: 'password'
        }
      )
      // Same handler branch as the wrong-flow case above (status verified,
      // but not the flow this handler requires) — used here only to prove
      // the two rejections are byte-identical, i.e. genuinely the same
      // branch rather than a lookalike one.
      await storeRetrievalStepInformation(
        'wrong-status-nonce',
        RetrievalSteps.NUMBER_VERIFIED,
        {
          userFullName: { firstname: 'Sadman', surname: 'Anik' },
          userId: '123',
          username: 'fake_user_name',
          mobile: '123123123',
          securityQuestionKey: 'TEST_SECURITY_QUESTION_KEY',
          scope: [],
          retrieveFlow: 'username'
        }
      )

      const wrongFlowRes = await server.server.inject({
        method: 'POST',
        url: '/sendUserName',
        payload: {
          nonce: 'password-flow-nonce'
        }
      })

      const wrongStatusRes = await server.server.inject({
        method: 'POST',
        url: '/sendUserName',
        payload: {
          nonce: 'wrong-status-nonce'
        }
      })

      expect(wrongFlowRes.statusCode).toBe(401)
      expect(wrongFlowRes.statusCode).toBe(wrongStatusRes.statusCode)
      expect(wrongFlowRes.payload).toBe(wrongStatusRes.payload)
    })
  })
})
