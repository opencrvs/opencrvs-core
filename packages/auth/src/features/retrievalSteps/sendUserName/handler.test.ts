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
  getRetrievalStepInformation,
  RetrievalSteps,
  type IRetrievalStepInformation
} from '@auth/features/retrievalSteps/verifyUser/service'
import { recordAnonymousUserAuditEvent } from '@auth/features/authenticate/service'
import { triggerUserEventNotification } from '@opencrvs/commons'

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
    recordAnonymousUserAuditEvent: jest.fn().mockResolvedValue(undefined)
  }
})

const VERIFIED_NONCE = '12345'
const UNKNOWN_NONCE = '54332'
const PASSWORD_FLOW_NONCE = 'password-flow-nonce'
const WRONG_STATUS_NONCE = 'wrong-status-nonce'

/**
 * The record the tests store. Each one overrides only the field it is about —
 * the status, or the flow — so what a case actually varies is visible.
 */
const retrievalRecord: Omit<IRetrievalStepInformation, 'status'> = {
  userFullName: { firstname: 'Sadman', surname: 'Anik' },
  userId: '123',
  username: 'fake_user_name',
  mobile: '123123123',
  securityQuestionKey: 'TEST_SECURITY_QUESTION_KEY',
  scope: [],
  retrieveFlow: 'username'
}

describe('username reminder', () => {
  let server: AuthServer

  beforeEach(async () => {
    server = await createServer()
    fetch.resetMocks()
    fetch.mockResponse('OK')
    jest.clearAllMocks()
    storeRetrievalStepInformation(
      VERIFIED_NONCE,
      RetrievalSteps.SECURITY_Q_VERIFIED,
      retrievalRecord
    )
  })

  describe('when a valid request is made', () => {
    it('returns OK', async () => {
      const res = await server.server.inject({
        method: 'POST',
        url: '/sendUserName',
        payload: {
          nonce: VERIFIED_NONCE
        }
      })

      expect(res.statusCode).toBe(200)
    })
    it('Triggers `username-reminder` event in countryconfig', async () => {
      await server.server.inject({
        method: 'POST',
        url: '/sendUserName',
        payload: {
          nonce: VERIFIED_NONCE
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
          nonce: UNKNOWN_NONCE
        }
      })

      expect(res.statusCode).toBe(401)
    })
  })
  describe('when invalid status found on retrieval step data', () => {
    it('responds with an error', async () => {
      await storeRetrievalStepInformation(
        VERIFIED_NONCE,
        RetrievalSteps.NUMBER_VERIFIED,
        retrievalRecord
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/sendUserName',
        payload: {
          nonce: VERIFIED_NONCE
        }
      })

      expect(res.statusCode).toBe(401)
    })
  })
  describe('when the record was verified under the password-reset flow', () => {
    it('rejects with the same 401 shape as a wrong status, since a password-reset link must not be usable to retrieve a username', async () => {
      // Verified, but under the password-reset flow.
      await storeRetrievalStepInformation(
        PASSWORD_FLOW_NONCE,
        RetrievalSteps.SECURITY_Q_VERIFIED,
        { ...retrievalRecord, retrieveFlow: 'password' }
      )

      // The right flow, but stopped a step short of verified. Stored only to
      // compare against: the two rejections must be byte-identical, proving
      // they come from one branch rather than two that merely look alike.
      await storeRetrievalStepInformation(
        WRONG_STATUS_NONCE,
        RetrievalSteps.NUMBER_VERIFIED,
        retrievalRecord
      )

      const wrongFlowRes = await server.server.inject({
        method: 'POST',
        url: '/sendUserName',
        payload: {
          nonce: PASSWORD_FLOW_NONCE
        }
      })

      const wrongStatusRes = await server.server.inject({
        method: 'POST',
        url: '/sendUserName',
        payload: {
          nonce: WRONG_STATUS_NONCE
        }
      })

      expect(wrongFlowRes.statusCode).toBe(401)
      expect(wrongFlowRes.statusCode).toBe(wrongStatusRes.statusCode)
      expect(wrongFlowRes.payload).toBe(wrongStatusRes.payload)

      // The status code alone would still pass if the guard ran after the
      // work: assert every side effect past it stayed untouched.
      expect(triggerUserEventNotification).not.toHaveBeenCalled()
      expect(recordAnonymousUserAuditEvent).not.toHaveBeenCalled()

      // The record surviving is what proves deleteRetrievalStepInformation
      // never ran, so a rejected attempt does not consume the user's nonce.
      await expect(
        getRetrievalStepInformation(PASSWORD_FLOW_NONCE)
      ).resolves.toMatchObject({ retrieveFlow: 'password' })
    })
  })
})
