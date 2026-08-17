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
import * as verifyUserService from '@auth/features/retrievalSteps/verifyUser/service'
import * as codeService from '@auth/features/verifyCode/service'
import {
  getRetrievalStepInformation,
  RetrievalSteps,
  RECOVERY_RESPONSE_FLOOR_MS
} from '@auth/features/retrievalSteps/verifyUser/service'
import { triggerUserEventNotification } from '@opencrvs/commons'

jest.mock('@opencrvs/commons', () => {
  const actual = jest.requireActual('@opencrvs/commons')
  return {
    __esModule: true,
    ...actual,
    triggerUserEventNotification: jest.fn().mockResolvedValue(undefined)
  }
})

const mockedTriggerUserEventNotification =
  triggerUserEventNotification as jest.Mock

const foundUser = {
  userId: '1',
  username: 'fake_user_name',
  userFullName: { firstname: 'Sadman', surname: 'Anik' },
  scope: ['demo'],
  status: 'active',
  mobile: '+8801711111111',
  email: 'sadman@example.com',
  securityQuestionKey: 'dummyKey'
}

describe('verifyUser handler', () => {
  let server: AuthServer

  beforeEach(async () => {
    server = await createServer()
    mockedTriggerUserEventNotification.mockClear()
    mockedTriggerUserEventNotification.mockResolvedValue(
      undefined as unknown as Response
    )
  })

  describe('when the account exists', () => {
    it('responds 200 with an empty body, stores a retrieval-step record, and dispatches a password-reset-link notification', async () => {
      jest.spyOn(verifyUserService, 'verifyUser').mockResolvedValue(foundUser)
      jest
        .spyOn(codeService, 'generateNonce')
        .mockReturnValueOnce('token-found-password')

      const res = await server.server.inject({
        method: 'POST',
        url: '/verifyUser',
        payload: { email: 'a@b.co', retrieveFlow: 'password' }
      })

      expect(res.statusCode).toBe(200)
      expect(res.payload).toBe('')

      const stored = await getRetrievalStepInformation('token-found-password')
      expect(stored.status).toBe(RetrievalSteps.WAITING_FOR_VERIFICATION)
      expect(stored.userId).toBe(foundUser.userId)
      expect(stored.retrieveFlow).toBe('password')

      expect(mockedTriggerUserEventNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'password-reset-link',
          payload: expect.objectContaining({
            token: 'token-found-password',
            recipient: expect.objectContaining({
              name: foundUser.userFullName,
              mobile: foundUser.mobile,
              email: foundUser.email
            })
          })
        })
      )
    })

    it('dispatches a username-reminder-link notification on the username flow', async () => {
      jest.spyOn(verifyUserService, 'verifyUser').mockResolvedValue(foundUser)
      jest
        .spyOn(codeService, 'generateNonce')
        .mockReturnValueOnce('token-found-username')

      const res = await server.server.inject({
        method: 'POST',
        url: '/verifyUser',
        payload: { email: 'a@b.co', retrieveFlow: 'username' }
      })

      expect(res.statusCode).toBe(200)
      expect(res.payload).toBe('')

      expect(mockedTriggerUserEventNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'username-reminder-link',
          payload: expect.objectContaining({
            token: 'token-found-username'
          })
        })
      )

      const stored = await getRetrievalStepInformation('token-found-username')
      expect(stored.retrieveFlow).toBe('username')
    })
  })

  describe('when the account does not exist', () => {
    it('responds 200 with an empty body and dispatches no notification', async () => {
      jest.spyOn(verifyUserService, 'verifyUser').mockRejectedValue(new Error())

      const res = await server.server.inject({
        method: 'POST',
        url: '/verifyUser',
        payload: { email: 'x@y.co', retrieveFlow: 'password' }
      })

      expect(res.statusCode).toBe(200)
      expect(res.payload).toBe('')
      expect(mockedTriggerUserEventNotification).not.toHaveBeenCalled()
    })
  })

  describe('when the events service is unreachable', () => {
    it('responds 200 with an empty body and dispatches no notification', async () => {
      jest
        .spyOn(verifyUserService, 'verifyUser')
        .mockRejectedValue(new Error('fetch failed'))

      const res = await server.server.inject({
        method: 'POST',
        url: '/verifyUser',
        payload: { mobile: '+8801711111111', retrieveFlow: 'password' }
      })

      expect(res.statusCode).toBe(200)
      expect(res.payload).toBe('')
      expect(mockedTriggerUserEventNotification).not.toHaveBeenCalled()
    })
  })

  describe('when the notification dispatch fails', () => {
    it('still responds 200 with an empty body', async () => {
      jest.spyOn(verifyUserService, 'verifyUser').mockResolvedValue(foundUser)
      jest
        .spyOn(codeService, 'generateNonce')
        .mockReturnValueOnce('token-dispatch-failure')
      mockedTriggerUserEventNotification.mockRejectedValueOnce(
        new Error('countryconfig down')
      )

      const res = await server.server.inject({
        method: 'POST',
        url: '/verifyUser',
        payload: { email: 'a@b.co', retrieveFlow: 'password' }
      })

      expect(res.statusCode).toBe(200)
      expect(res.payload).toBe('')
    })
  })

  it('answers identically whether or not the user exists', async () => {
    jest.spyOn(verifyUserService, 'verifyUser').mockResolvedValue(foundUser)
    jest
      .spyOn(codeService, 'generateNonce')
      .mockReturnValueOnce('token-equivalence-found')
    const found = await server.server.inject({
      method: 'POST',
      url: '/verifyUser',
      payload: { email: 'a@b.co', retrieveFlow: 'password' }
    })

    jest.spyOn(verifyUserService, 'verifyUser').mockRejectedValue(new Error())
    const missing = await server.server.inject({
      method: 'POST',
      url: '/verifyUser',
      payload: { email: 'x@y.co', retrieveFlow: 'password' }
    })

    expect(found.statusCode).toBe(missing.statusCode)
    expect(found.payload).toBe(missing.payload)
    expect(found.headers['content-type']).toBe(missing.headers['content-type'])
  })

  it('holds a request that fails immediately for as long as one that succeeds', async () => {
    /*
     * The case a body-only comparison misses: a dependency that rejects before
     * doing any work — the events service being down — would otherwise answer
     * far sooner than a real lookup and time the account into existence.
     * `padRecoveryResponse` is what both durations are pinned to, so assert
     * against its floor rather than against each other, which would be flaky.
     */
    jest
      .spyOn(verifyUserService, 'verifyUser')
      .mockRejectedValue(new Error('events unreachable'))

    const startedAt = Date.now()
    const res = await server.server.inject({
      method: 'POST',
      url: '/verifyUser',
      payload: { email: 'x@y.co', retrieveFlow: 'password' }
    })

    expect(res.statusCode).toBe(200)
    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(
      RECOVERY_RESPONSE_FLOOR_MS
    )
  })
})
