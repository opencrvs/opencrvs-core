import * as fetchAny from 'jest-fetch-mock'
import { createServer } from '@auth/index'
import {
  RetrievalSteps,
  storeRetrievalStepInformation,
  getRetrievalStepInformation
} from '@auth/features/verifyUser/service'
// tslint:disable-next-line:mocha-no-side-effect-code
const fetch = fetchAny as fetchAny.FetchMock

describe('security question answer checking', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
    fetch.resetMocks()
    fetch.mockResponse('')
    await storeRetrievalStepInformation(
      'TEST_NONCE',
      '123',
      [],
      '1231231',
      RetrievalSteps.NUMBER_VERIFIED
    )
  })

  describe('when submitted security answer is correct', () => {
    let res: any
    beforeEach(async () => {
      res = await server.server.inject({
        method: 'POST',
        url: '/verifySecurityAnswer',
        payload: {
          questionKey: 'TEST_QUESTION',
          answer: 'something',
          nonce: 'TEST_NONCE'
        }
      })
    })
    it('responds with ok', () => {
      expect(res.statusCode).toBe(200)
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
          [],
          '1231231',
          RetrievalSteps.WAITING_FOR_VERIFICATION
        )
      )
      it('responds with an error', async () => {
        res = await server.server.inject({
          method: 'POST',
          url: '/verifySecurityAnswer',
          payload: {
            questionKey: 'TEST_QUESTION',
            answer: 'something',
            nonce: 'TEST_NONCE'
          }
        })

        expect(res.statusCode).toBe(401)
      })
    })
  })
  describe('when submitted security answer is incorrect', () => {
    beforeEach(() => fetch.mockReject(new Error()))
    it('responds with an error', async () => {
      const res = await server.server.inject({
        method: 'POST',
        url: '/verifySecurityAnswer',
        payload: {
          questionKey: 'TEST_QUESTION',
          answer: 'something',
          nonce: 'TEST_NONCE'
        }
      })

      expect(res.statusCode).toBe(401)
    })
  })
})
