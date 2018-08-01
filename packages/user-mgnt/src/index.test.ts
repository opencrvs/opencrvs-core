import { createServer } from './index'
import * as database from './database'

// tslint:disable-next-line no-empty
const noop = () => {}

const { start, stop } = database

beforeEach(() => {
  // @ts-ignore
  database.start = noop
  // @ts-ignore
  database.stop = noop
})

afterEach(() => {
  // @ts-ignore
  database.start = start
  // @ts-ignore
  database.stop = stop
})

test('should start and stop server without error', async () => {
  const server = await createServer()

  // @ts-ignore
  server.server.start = noop
  // @ts-ignore
  server.server.stop = noop

  await server.start()
  await server.stop()
})

describe('Route authorization', () => {
  it('blocks requests without a token', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/check-token'
    })
    expect(res.statusCode).toBe(401)
  })

  it('blocks requests with an invalid token', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/check-token',
      headers: {
        Authorization: 'Bearer abc'
      }
    })
    expect(res.statusCode).toBe(401)
  })

  it('accepts requests with a valid token', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/check-token',
      headers: {
        // Generated with "auth" project's generator command
        Authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMwNDA1MzIsImV4cCI6MTU0MzA0MDUzMSwiYXVkIjpbInVzZXItbWFuYWdlbWVudCJdLCJzdWIiOiIxIn0.cXtDg_Y3St9dFds9m0ydId59aVIr5WS9ZzSuw9iB8xxRXsFpSoTVBj14umjmHDa8JA92WY6LqlVb9xwR4Nxef3SEW0Lo4MTCccDNy6ev3WI9JVNLiG2O-BE5HdU9dR1iArQutnN4kHAtf1VjGQKnS6sL73KAycQxlLRUXduq40CelmcUlPoo6C3CgcQZQxgvA420vyP2a8Ci0sMZfqmZeTtDIov_hkjmlkqfhgtuyfpKFO7uriNpubajYHPuk2JkqTEOBvtLV01YzfJ_fe8jMNW1WJUpO1rZhiBVPREsPaVtmm8Jv4cp7VPyo3uxcSNRhCsLlvglWGVqr-6q5L3K5k8LON_nYZC2pntv0_Fd-VsSyfbLfZAbOdpaExG9T149pW7rMylseVLmFDpsmDHKCc7ysOU-Kvt_gkLgAK_Qfp7UtcsiivLe-wpxcKvMFdZe5uICqIQHESMw7rxzVl60z7_SCAv1gd-4ZqWyqO-piYKGipU70mFuHgwQIGv4im1MiuMe158NNB-KZavEMg1kFDluzW9VhVS3Zex6OKRWCXz0vrCySseOqty6omz0LkiF52umhWZk61sL2TNjUF6-sgRoGo7vpFph5khGWAhSNls3F_a2vxM-HqbAkJAVNKTWkjkGaKrnHN7XGTQG72QWNNxQFM8tLdS4-DwL6CgP6ik'
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('blocks requests with a token with invalid signature', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/check-token',
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMwNDA1MzIsImV4cCI6MTU0MzA0MDUzMSwiYXVkIjpbInVzZXItbWFuYWdlbWVudCJdLCJzdWIiOiIxIn0.cXtDg_Y3St9dFds9m0ydId59aVIr5WS9ZzSuw9iB8xxRXsFpSoTVBj14umjmHDa8JA92WY6LqlVb9xwR4Nxef3SEW0Lo4MTCccDNy6ev3WI9JVNLiG2O-BE5HdU9dR1iArQutnN4kHAtf1VjGQKnS6sL73KAycQxlLRUXduq40CelmcUlPoo6C3CgcQZQxgvA420vyP2a8Ci0sMZfqmZeTtDIov_hkjmlkqfhgtuyfpKFO7uriNpubajYHPuk2JkqTEOBvtLV01YzfJ_fe8jMNW1WJUpO1rZhiBVPREsPaVtmm8Jv4cp7VPyo3uxcSNRhCsLlvglWGVqr-6q5L3K5k8LON_nYZC2pntv0_Fd-VsSyfbLfZAbOdpaExG9T149pW7rMylseVLmFDpsmDHKCc7ysOU-Kvt_gkLgAK_Qfp7UtcsiivLe-wpxcKvMFdZe5uICqIQHESMw7rxzVl60z7_SCAv1gd-4ZqWyqO-piYKGipU70mFuHgwQIGv4im1MiuMe158NNB-KZavEMg1kFDluzW9VhVS3Zex6OKRWCXz0vrCySseOqty6omz0LkiF52umhWZk61sL2TNjUF6-sgRoGo7vpFph5khGWAhSNls3F_a2vxM-HqbAkJAVNKTWkjkGaKrnHN7XGTQG72QWNNxQFM8tLdS4-DwL6CgP6id'
      }
    })
    expect(res.statusCode).toBe(401)
  })

  it('blocks requests with expired token', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/check-token',
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMwNDA2MzIsImV4cCI6MTUzMzAzOTYzMiwiYXVkIjpbInVzZXItbWFuYWdlbWVudCJdLCJzdWIiOiIxIn0.Xfhbx7QKcWGuj1VgEwacpAtomRpY-FfPj3pI3vlK4htFWhL4Kh8XoZE2qpsaM2CNPuK1_h3oyJYp8DNz2026KMwFjVrOTf4ii3heUSGmeL8K9LFp7Il28a3slozxit_2Z1rhZGm__LNpryV4pCMVMz2J2nAt42XlBrxMSi4THVsjxkAQNyL0LlGKcC4yEV--KvAM81Bd9S4jmedFDhkPjSsmKvoy6AJu9nLt-2GaLoUgMmYiAdGTBBP6hSLEZWlLovtJMDj1BmeglRlgzdK4_nI-orwBZsbXyTMDvyYqOE6WrWHxCfsG3C00RbLdCTL7CIE5VWaWYIv-MhEiu1j1ALeoETbErD9IrqMhuXbsQsaV6O69HKXZ23WjIYZMwty5tEpKcUlWhUF40z3HbdjCRxbzuQU4SeGJLxZZMS85P_SNZZrD6fqB8sbN8OdWk0V873d5T9MKbyiGgEwmoqrXnPGmak5fjC-BwiH03qKw7Wl8mC26fGPC--SS3-1-FA7sLeVa-vFXZw1r8XU2hQH6k9lxDuOvyyzmem1ip2u3_CFy1yZbz3KBDxSEm9NLrqNilPpN1mYX8KpwWkWrIEJ2A7gYtWqS76ZqLfEluFhx4QcsG3Tbt0a0BWtC-1zhZ77ywXQVgCS3den4OIxU3KFPNIroiI2WyWhYBeUnJNVWC9c'
      }
    })
    expect(res.statusCode).toBe(401)
  })
  it('blocks requests signed with wrong algorithm (HS512)', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/check-token',
      headers: {
        Authorization:
          // Header: { "alg": "HS512", "typ": "JWT" }
          // Payload: { "sub": "1", "exp": 1532937683, "role": "admin", "iat": 1532937083 }
          // Secret: test/cert.key.pub
          'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMwNDA2ODcsImV4cCI6MTU0MzA0MDY4NiwiYXVkIjpbInVzZXItbWFuYWdlbWVudCJdLCJzdWIiOiIxIn0.YeK0Uv7ePjSvwsJHkQOqiee5iQYV9Gmb-w3o5NXtDkfamy6vROcjr-symJfODkDI_OJanzWXzXUkqvdEPmzMZw'
      }
    })

    expect(res.statusCode).toBe(401)
  })
  it('blocks requests signed with wrong audience', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/check-token',
      headers: {
        Authorization:
          /*
          Header: { "alg": "RS256", "typ": "JWT" }
          Payload:
          {
            "role": "admin",
            "iat": 1533040746,
            "exp": 1543040745,
            "aud": [
              "hello"
            ],
            "sub": "1"
          }
           Secret: test/cert.key.pub
           */
          'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMwNDA3NDYsImV4cCI6MTU0MzA0MDc0NSwiYXVkIjpbImhlbGxvIl0sInN1YiI6IjEifQ.sfpuJyaj9b_i078Cp5zHXvxpT_R9Yn_Iq32zQ22JVTTacbX_DfDfbq7Y8j4XUphaKs7FnubV14SVKEUOG4A7y5jSPoCsGRk1HTfUY7rko45MN1ZRdJVkvUGUMpV3w0WmNflzBeXTGb8B9OTuPeOWpYpFxFtBEFmhnxMaCmxdwtLrVDBVYzrSngXWGhvmLFmFVB-Ac0oM8cP15gNojnMojQhk00emqutHpvYrzXdQo_8jZlNLPcLmSXpTqzghbK5qOACXMKdfHV8wOPMBOdJCccAAOs-3SqxwIJC_uhxnwWHcp1xZ45SdWEssRF-f75HA3NqqBtCMsSA08GaCDj5lW4B0SuE51nklGZcHZiWLoPIkhn-CLFIqmQIOI7hSTJMjmWnIJ4QTTofsupfZ3foF7F9IBCx9nN-JlqW9u5eKR3Cre9Unx4Rhlsj-fbL-u8wZ4NOA5vNSooghcX45JE70ctTEFHv_C6KztzlOIyI74RNVAXHobUM610j2AnJif_5jgGKz9T5ad4NyePf8QP4ZyxKWIi1pDt-3yDYBHA9Ip20SX2tfuFGvu8cgbcuR6WInKu8sK5jVb4J4RRbHoW_Q-dzRTpCE5Wx-5Gt7Iu3BJSJ1JBELxM_Wli4kkKIc1NZ_BS9D1CEn89WTE8HZYZPcbQBEcIvfRNrmn-CY8truAIY'
      }
    })

    expect(res.statusCode).toBe(401)
  })
})
