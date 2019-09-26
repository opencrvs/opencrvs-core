import { createServer } from '@auth/index'
import { get, setex } from '@auth/database'
import { INVALID_TOKEN_NAMESPACE } from '@auth/constants'

describe('verify token handler', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it("returns valid when the token isn't in redis", async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/verifyToken',
      payload: {
        token: '111'
      }
    })

    expect(res.statusCode).toBe(200)
    expect(res.result).toEqual({ valid: true })
  })

  it('returns invalid when the token is in redis', async () => {
    setex(`${INVALID_TOKEN_NAMESPACE}:111`, 10, 'INVALID')

    const res = await server.server.inject({
      method: 'POST',
      url: '/verifyToken',
      payload: {
        token: '111'
      }
    })

    expect(res.statusCode).toBe(200)
    expect(res.result).toEqual({ valid: false })
  })

  it('catches redis errors', async () => {
    ;(get as jest.Mock).mockImplementationOnce(() => Promise.reject('boom'))

    const res = await server.server.inject({
      method: 'POST',
      url: '/verifyToken',
      payload: {
        token: '111'
      }
    })

    expect(res.statusCode).toBe(500)
  })
})
