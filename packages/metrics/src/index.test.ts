/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { createServer } from '@metrics/index'

jest.mock('./configApi', () => {
  const originalModule = jest.requireActual('./configApi')
  return {
    __esModule: true,
    ...originalModule,
    getApplicationConfig: () =>
      Promise.resolve({
        API_GATEWAY_URL: 'http://localhost:7070/',
        CONFIG_API_URL: 'http://localhost:2021',
        LOGIN_URL: 'http://localhost:3020',
        AUTH_URL: 'http://localhost:4040',
        RESOURCES_URL: 'http://localhost:3040',
        APPLICATION_NAME: 'Farajaland CRVS',
        CERTIFICATE_PRINT_CHARGE_FREE_PERIOD: 36500,
        CERTIFICATE_PRINT_CHARGE_UP_LIMIT: 36500,
        CERTIFICATE_PRINT_LOWEST_CHARGE: 0,
        CERTIFICATE_PRINT_HIGHEST_CHARGE: 0,
        UI_POLLING_INTERVAL: 5000,
        FIELD_AGENT_AUDIT_LOCATIONS: 'DISTRICT',
        APPLICATION_AUDIT_LOCATIONS: 'DISTRICT',
        INFORMANT_MINIMUM_AGE: 16,
        HIDE_EVENT_REGISTER_INFORMATION: false,
        EXTERNAL_VALIDATION_WORKQUEUE: false,
        PHONE_NUMBER_PATTERN: {
          pattern: '/^0(7|9)[0-9]{1}[0-9]{7}$/',
          example: '0970545855',
          start: '0[7|9]',
          num: '10',
          mask: {
            startForm: 4,
            endBefore: 2
          }
        },
        SENTRY: 'https://f892d643aab642108f44e2d1795706bc@sentry.io/1774604',
        LOGROCKET: 'opencrvs-foundation/opencrvs-zambia',
        NID_NUMBER_PATTERN: {
          pattern: '/^[0-9]{9}$/',
          example: '4837281940',
          num: '9'
        },
        COUNTRY: 'zmb',
        LANGUAGES: 'en'
      })
  }
})

describe('Route authorization', () => {
  it('tests the health check', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/ping'
    })
    expect(res.result).toEqual({ success: true })
  })
  it('blocks requests without a token', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/tokenTest'
    })
    expect(res.statusCode).toBe(401)
  })

  it('blocks requests with an invalid token', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/tokenTest',
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
      audience: 'opencrvs:metrics-user'
    })
    const res = await server.server.inject({
      method: 'GET',
      url: '/tokenTest',
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
      audience: 'opencrvs:metrics-user'
    })
    const res = await server.server.inject({
      method: 'GET',
      url: '/tokenTest',
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
      audience: 'opencrvs:metrics-user',
      expiresIn: '1ms'
    })

    await new Promise((resolve) => {
      setTimeout(resolve, 5)
    })

    const res = await server.server.inject({
      method: 'GET',
      url: '/tokenTest',
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
      audience: 'opencrvs:metrics-user'
    })
    const res = await server.server.inject({
      method: 'GET',
      url: '/tokenTest',
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
      url: '/tokenTest',
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
      audience: 'opencrvs:metrics-user'
    })
    const res = await server.server.inject({
      method: 'GET',
      url: '/tokenTest',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(401)
  })
})
