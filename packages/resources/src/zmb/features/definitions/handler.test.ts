import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { createServer } from '@resources/index'

describe('definitions handler tests', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('returns definitions as json', async () => {
    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:resources-user'
    })

    const res = await server.server.inject({
      method: 'GET',
      url: '/zmb/definitions/register',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(JSON.parse(res.payload)).toBeDefined()
  })
})
