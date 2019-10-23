import { createServer } from '@auth/index'
import { get, setex } from '@auth/database'
import { INVALID_TOKEN_NAMESPACE } from '@auth/constants'

describe('invalidate token handler', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('add an invalid token to redis', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/invalidateToken',
      payload: {
        token: '111'
      }
    })

    expect(res.statusCode).toBe(200)

    const val = await get(`${INVALID_TOKEN_NAMESPACE}:111`)
    expect(val).toBe('INVALID')
  })

  it('catches redis errors', async () => {
    ;(setex as jest.Mock).mockImplementationOnce(() => Promise.reject('boom'))

    const res = await server.server.inject({
      method: 'POST',
      url: '/invalidateToken',
      payload: {
        token: '111'
      }
    })

    expect(res.statusCode).toBe(500)
  })
})
