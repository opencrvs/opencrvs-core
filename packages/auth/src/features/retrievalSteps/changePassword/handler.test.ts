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
import { AuthServer, createServer } from '@auth/server'
import {
  storeRetrievalStepInformation,
  RetrievalSteps,
  type IRetrievalStepInformation
} from '@auth/features/retrievalSteps/verifyUser/service'
import * as changePasswordService from '@auth/features/retrievalSteps/changePassword/service'

const VERIFIED_NONCE = '12345'
const UNKNOWN_NONCE = '54332'
const USERNAME_FLOW_NONCE = 'username-flow-nonce'
const WRONG_STATUS_NONCE = 'wrong-status-nonce'

const NEW_PASSWORD = 'newpass'

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
  retrieveFlow: 'password'
}

describe('password change', () => {
  let server: AuthServer
  let changePasswordSpy: jest.SpyInstance

  afterEach(() => {
    jest.restoreAllMocks()
  })

  beforeEach(async () => {
    server = await createServer()
    changePasswordSpy = jest
      .spyOn(changePasswordService, 'changePassword')
      .mockResolvedValue(undefined)
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
        url: '/changePassword',
        payload: {
          newPassword: NEW_PASSWORD,
          nonce: VERIFIED_NONCE
        }
      })

      expect(res.statusCode).toBe(200)
    })
    it('calls events service to change the password', async () => {
      await server.server.inject({
        method: 'POST',
        url: '/changePassword',
        payload: {
          newPassword: NEW_PASSWORD,
          nonce: VERIFIED_NONCE
        }
      })

      expect(changePasswordSpy).toHaveBeenCalledTimes(1)
    })
  })
  describe('when an invalid nonce is supplied', () => {
    it('responds with an error', async () => {
      const res = await server.server.inject({
        method: 'POST',
        url: '/changePassword',
        payload: {
          newPassword: NEW_PASSWORD,
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
        url: '/changePassword',
        payload: {
          newPassword: NEW_PASSWORD,
          nonce: VERIFIED_NONCE
        }
      })

      expect(res.statusCode).toBe(401)
    })
  })
  describe('when the record was verified under the username-reminder flow', () => {
    it('rejects with the same 401 shape as a wrong status, since a username-reminder link must not be usable to change a password', async () => {
      // Verified, but under the username-reminder flow.
      await storeRetrievalStepInformation(
        USERNAME_FLOW_NONCE,
        RetrievalSteps.SECURITY_Q_VERIFIED,
        { ...retrievalRecord, retrieveFlow: 'username' }
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
        url: '/changePassword',
        payload: {
          newPassword: NEW_PASSWORD,
          nonce: USERNAME_FLOW_NONCE
        }
      })

      const wrongStatusRes = await server.server.inject({
        method: 'POST',
        url: '/changePassword',
        payload: {
          newPassword: NEW_PASSWORD,
          nonce: WRONG_STATUS_NONCE
        }
      })

      expect(wrongFlowRes.statusCode).toBe(401)
      expect(wrongFlowRes.statusCode).toBe(wrongStatusRes.statusCode)
      expect(wrongFlowRes.payload).toBe(wrongStatusRes.payload)
      expect(changePasswordSpy).not.toHaveBeenCalled()
    })
  })
})
