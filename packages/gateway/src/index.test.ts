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
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { createServer } from '@gateway/server'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as fetchAny.FetchMock

describe('Route authorization', () => {
  let server: any
  beforeEach(async () => {
    server = await createServer()
    fetch.resetMocks()
  })
  it('blocks requests without a token', async () => {
    const res = await server.app.inject({
      method: 'GET',
      url: '/tokenTest'
    })
    expect(res.statusCode).toBe(401)
  })

  it('blocks requests with an invalid token', async () => {
    const res = await server.app.inject({
      method: 'GET',
      url: '/tokenTest',
      headers: {
        Authorization: 'Bearer abc'
      }
    })
    expect(res.statusCode).toBe(401)
  })

  it('accepts requests with a valid token', async () => {
    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:gateway-user'
    })
    const res = await server.app.inject({
      method: 'GET',
      url: '/tokenTest',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('blocks requests with a token with invalid signature', async () => {
    const token = jwt.sign({}, readFileSync('../auth/test/cert-invalid.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:gateway-user'
    })
    const res = await server.app.inject({
      method: 'GET',
      url: '/tokenTest',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(401)
  })

  it('blocks requests with expired token', async () => {
    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:gateway-user',
      expiresIn: '1ms'
    })

    await new Promise((resolve) => {
      setTimeout(resolve, 5)
    })

    const res = await server.app.inject({
      method: 'GET',
      url: '/tokenTest',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(401)
  })

  it('blocks requests signed with wrong algorithm (RS384)', async () => {
    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS384',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:gateway-user'
    })
    const res = await server.app.inject({
      method: 'GET',
      url: '/tokenTest',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(401)
  })

  it('blocks requests signed with wrong audience', async () => {
    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:NOT_VALID'
    })
    const res = await server.app.inject({
      method: 'GET',
      url: '/tokenTest',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(401)
  })

  it('blocks requests signed with wrong issuer', async () => {
    const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:NOT_VALID',
      audience: 'opencrvs:gateway-user'
    })
    const res = await server.app.inject({
      method: 'GET',
      url: '/tokenTest',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(401)
  })
  it('Tests the health check with a valid parameter', async () => {
    fetch.mockResponse(
      JSON.stringify({
        success: true
      })
    )
    const res = await server.app.inject({
      method: 'GET',
      url: '/ping?service=search'
    })
    expect(res.result).toEqual({
      success: true
    })
  })
  it('Fails the health check with a missing parameter', async () => {
    fetch.mockResponse(
      JSON.stringify({
        success: true
      })
    )
    const res = await server.app.inject({
      method: 'GET',
      url: '/ping'
    })
    expect(res.statusCode).toBe(400)
  })
  it('Rejects the health check with an invalid parameter', async () => {
    fetch.mockResponse(
      JSON.stringify({
        success: true
      })
    )
    const res = await server.app.inject({
      method: 'GET',
      url: '/ping?service=nonsense'
    })
    expect(res.result.message).toEqual(
      `"service" must be one of [auth, user-mgnt, metrics, notification, countryconfig, search, workflow, gateway]`
    )
  })
  it('Fails the health check for a failed health check on a running service', async () => {
    fetch.mockResponse(
      JSON.stringify({
        success: false
      })
    )
    const res = await server.app.inject({
      method: 'GET',
      url: '/ping?service=auth'
    })
    expect(res.result.message).toEqual('An internal server error occurred')
  })
  it('Fails the health check for a failed and not running service', async () => {
    fetch.mockReject(new Error('An internal server error occurred'))
    const res = await server.app.inject({
      method: 'GET',
      url: '/ping?service=auth'
    })
    expect(res.result.message).toEqual('An internal server error occurred')
  })
})
