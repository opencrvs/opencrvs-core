import * as fetchAny from 'jest-fetch-mock'
import { createServer } from '@auth/index'
import {
  RetrievalSteps,
  storeRetrievalStepInformation,
  getRetrievalStepInformation
} from '@auth/features/retrievalSteps/verifyUser/service'

const fetch = fetchAny as fetchAny.FetchMock

describe('security question answer checking', () => {
  let server: any

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
      '123',
      'face_user_name',
      '1231231',
      RetrievalSteps.NUMBER_VERIFIED,
      'TEST_SECURITY_QUESTION_KEY'
    )
  })

  describe('when submitted security answer is correct', () => {
    let res: any
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
          '123',
          'face_user_name',
          '1231231',
          RetrievalSteps.WAITING_FOR_VERIFICATION,
          'TEST_SECURITY_QUESTION_KEY'
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
