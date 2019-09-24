import * as fetchAny from 'jest-fetch-mock'
import { createServer } from '@auth/index'
import { storePasswordChangeCode } from '@auth/features/changePassword/service'
// tslint:disable-next-line:mocha-no-side-effect-code
const fetch = (fetchAny as unknown) as fetchAny.FetchMock

describe('password change', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
    fetch.resetMocks()
    fetch.mockResponse('OK')
    storePasswordChangeCode('12345', 'fake_code')
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
})
