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
  RetrievalSteps,
  storeRetrievalStepInformation,
  getRetrievalStepInformation
} from '@auth/features/retrievalSteps/verifyUser/service'

const fetch = fetchAny as fetchAny.FetchMock

describe('security question answer checking', () => {
  let server: AuthServer

  beforeEach(async () => {
    server = await createServer()
    fetch.resetMocks()
    fetch.mockResponse(
      JSON.stringify({
        matched: true,
        questionKey: 'TEST_SECURITY_QUESTION_KEY'
      })
    )
    await storeRetrievalStepInformation(
      'TEST_NONCE',
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
  })

  describe('when submitted security answer is correct', () => {
    let res: {
      statusCode: number
      payload: string
    }
    beforeEach(async () => {
      res = await server.server.inject({
        method: 'POST',
        url: '/verifySecurityAnswer',
        payload: {
          answer: 'something',
          nonce: 'TEST_NONCE'
        }
      })
    })
    it('responds with ok', () => {
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.payload).matched).toBe(true)
      expect(JSON.parse(res.payload).questionKey).toBeUndefined()
    })
    it('updates the nonce status', async () => {
      expect((await getRetrievalStepInformation('TEST_NONCE')).status).toBe(
        RetrievalSteps.SECURITY_Q_VERIFIED
      )
    })
    describe('when nonce status was invalid (user skipping required steps)', () => {
      beforeEach(() =>
        storeRetrievalStepInformation(
          'TEST_NONCE',
          RetrievalSteps.WAITING_FOR_VERIFICATION,
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
      )

      it('responds with an error', async () => {
        res = await server.server.inject({
          method: 'POST',
          url: '/verifySecurityAnswer',
          payload: {
            answer: 'something',
            nonce: 'TEST_NONCE'
          }
        })

        expect(res.statusCode).toBe(401)
      })
    })
  })
  describe('when submitted security answer is incorrect', () => {
    beforeEach(() =>
      fetch.mockResponse(
        JSON.stringify({
          matched: false,
          questionKey: 'ANOTHER_KEY'
        })
      )
    )
    it('responds with matched as false', async () => {
      const res = await server.server.inject({
        method: 'POST',
        url: '/verifySecurityAnswer',
        payload: {
          answer: 'something',
          nonce: 'TEST_NONCE'
        }
      })

      expect(JSON.parse(res.payload).matched).toBe(false)
      expect(JSON.parse(res.payload).securityQuestionKey).toBe('ANOTHER_KEY')
    })
  })
})
