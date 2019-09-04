import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { createServer } from '@resources/index'

describe('assets handler tests', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('returns appropriate asset', async () => {
    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:resources-user'
    })

    const res = await server.server.inject({
      method: 'GET',
      url: '/bgd/assets/logo.png',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.payload).toBeDefined()
  })
})
