import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { createServer } from '@resources/index'
import * as locationsService from '@resources/bgd/features/administrative/service/service'

describe('Route authorization', () => {
  beforeAll(() => {
    jest
      .spyOn(locationsService, 'getLocations')
      .mockReturnValue(Promise.resolve({ data: [] }))
  })

  it('blocks requests without a token', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/bgd/locations'
    })
    expect(res.statusCode).toBe(401)
  })

  it('blocks requests with an invalid token', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/bgd/locations',
      headers: {
        Authorization: 'Bearer abc'
      }
    })
    expect(res.statusCode).toBe(401)
  })

  it('accepts requests with a valid token', async () => {
    const server = await createServer()
    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:resources-user'
    })
    const res = await server.server.inject({
      method: 'GET',
      url: '/bgd/locations',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('blocks requests with a token with invalid signature', async () => {
    const server = await createServer()
    const token = jwt.sign({}, readFileSync('../auth/test/cert-invalid.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:resources-user'
    })
    const res = await server.server.inject({
      method: 'GET',
      url: '/bgd/locations',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(401)
  })

  it('blocks requests with expired token', async () => {
    const server = await createServer()
    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:resources-user',
      expiresIn: '1ms'
    })

    await new Promise(resolve => {
      setTimeout(resolve, 5)
    })

    const res = await server.server.inject({
      method: 'GET',
      url: '/bgd/locations',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(401)
  })

  it('blocks requests signed with wrong algorithm (HS512)', async () => {
    const server = await createServer()
    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'HS512',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:resources-user'
    })
    const res = await server.server.inject({
      method: 'GET',
      url: '/bgd/locations',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(401)
  })

  it('blocks requests signed with wrong audience', async () => {
    const server = await createServer()
    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:NOT_VALID'
    })
    const res = await server.server.inject({
      method: 'GET',
      url: '/bgd/locations',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(401)
  })

  it('blocks requests signed with wrong issuer', async () => {
    const server = await createServer()
    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:NOT_VALID',
      audience: 'opencrvs:resources-user'
    })
    const res = await server.server.inject({
      method: 'GET',
      url: '/bgd/locations',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(401)
  })
})
