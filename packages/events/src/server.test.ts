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
import { generateKeyPairSync } from 'crypto'
import { join } from 'path'
import superjson from 'superjson'
import {
  createTRPCClient,
  httpBatchLink,
  HTTPHeaders,
  httpLink,
  TRPCClientError
} from '@trpc/client'
import { TRPCError } from '@trpc/server'
import * as jwt from 'jsonwebtoken'
import {
  ActionStatus,
  ActionType,
  BearerTokenByUserType,
  encodeScope,
  getTokenPayload,
  getUUID,
  TENNIS_CLUB_MEMBERSHIP,
  TestUserRole,
  TokenUserType
} from '@opencrvs/commons'
import { AppRouter } from './router'
import { server } from './server'
import { createTestToken, setupTestCase } from './tests/utils'
import { InternalRouter } from './router/internalRouter'
/**
 * Server-level integration tests.
 *
 * These verify startup, transport-level auth, and upstream error handling.
 * They do NOT mock the tRPC context — for route-level logic, see event.create.test.ts.
 */

let serverInstance: ReturnType<typeof server>
let url: string

let appClient: ReturnType<typeof createTRPCClient<AppRouter>>
let internalServiceClient: ReturnType<typeof createTRPCClient<InternalRouter>>
const cert = readFileSync(join(process.cwd(), 'src/tests/cert.key'))

function forgeUnsignedToken(payload: object) {
  const header = Buffer.from(
    JSON.stringify({ alg: 'none', typ: 'JWT' })
  ).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')

  return `${header}.${body}.`
}

function createValidAppToken(payload: Record<string, unknown> = {}) {
  return jwt.sign(
    {
      scope: [
        encodeScope({
          type: 'record.create',
          options: { event: [TENNIS_CLUB_MEMBERSHIP] }
        })
      ],
      userType: TokenUserType.enum.user,
      role: TestUserRole.enum.LOCAL_REGISTRAR,
      ...payload
    },
    cert,
    {
      subject: '67ef7f83d6a9cb92e9edaa99',
      algorithm: 'RS256',
      expiresIn: '1h',
      audience: 'opencrvs:events-user',
      issuer: 'opencrvs:auth-service'
    }
  )
}

beforeAll(() => {
  serverInstance = server()
  const listener = serverInstance.listen(0, () => {
    const address = listener.address()
    const port = typeof address === 'object' && address?.port
    url = `http://localhost:${port}`

    appClient = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url,
          transformer: superjson,
          headers({ opList }) {
            const ctxHeaders = opList[0].context.headers
            if (ctxHeaders && typeof ctxHeaders === 'object') {
              return ctxHeaders as HTTPHeaders
            }
            return {}
          }
        })
      ]
    })
    internalServiceClient = createTRPCClient<InternalRouter>({
      links: [
        httpLink({
          url: `${url}/internal`,
          transformer: superjson,
          headers({ op }) {
            const ctxHeaders = op.context.headers
            if (ctxHeaders && typeof ctxHeaders === 'object') {
              return ctxHeaders as HTTPHeaders
            }
            return {}
          }
        })
      ]
    })
  })
})

afterAll(() => serverInstance.close())

// ─── helpers ────────────────────────────────────────────────────────────────

function createEvent(token: string) {
  return appClient.event.create.mutate(
    { transactionId: getUUID(), type: TENNIS_CLUB_MEMBERSHIP },
    { context: { headers: { authorization: token } } }
  )
}

// ─── server lifecycle ────────────────────────────────────────────────────────

test('starts up and correctly deserializes a valid upstream response', async () => {
  const { user } = await setupTestCase()
  const tokenWithCreateScope = createTestToken({
    userId: user.id,
    scopes: [encodeScope({ type: 'record.create' })],
    userType: TokenUserType.enum.user,
    role: user.role
  })

  const response = await createEvent(tokenWithCreateScope)
  expect(response.actions).toHaveLength(2)
  const [action] = response.actions
  expect(action.type).toBe(ActionType.CREATE)
  expect(action.createdBy).toBe(user.id)
  expect(action.createdAtLocation).toBe(user.primaryOfficeId)
  expect(action.status).toBe(ActionStatus.Accepted)
})

test('continues accepting requests after a failed one', async () => {
  const { user, generator } = await setupTestCase()

  const tokenWithoutScope = createTestToken({
    userId: user.id,
    scopes: [],
    userType: TokenUserType.enum.user,
    role: user.role
  })

  await expect(
    appClient.event.create.mutate(generator.event.create(), {
      context: { headers: { authorization: tokenWithoutScope } }
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))

  const tokenWithScope = createTestToken({
    userId: user.id,
    scopes: [encodeScope({ type: 'record.create' })],
    userType: TokenUserType.enum.user,
    role: user.role
  })

  await expect(
    appClient.event.create.mutate(generator.event.create(), {
      context: { headers: { authorization: tokenWithScope } }
    })
  ).resolves.toBeDefined()
})

// ─── auth failures ───────────────────────────────────────────────────────────

test('rejects requests with no authorization header', async () => {
  await expect(
    appClient.event.create.mutate(
      { transactionId: getUUID(), type: TENNIS_CLUB_MEMBERSHIP },
      { context: { headers: {} } }
    )
  ).rejects.toThrow(
    new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authorization token is missing'
    })
  )
})

test('rejects requests with a malformed token', async () => {
  await expect(createEvent('bad-token')).rejects.toMatchObject({
    data: { code: 'UNAUTHORIZED' }
  })
})

test('rejects requests where token lacks required scope', async () => {
  const { user } = await setupTestCase()

  const tokenWithoutScope = createTestToken({
    userId: user.id,
    scopes: [],
    userType: TokenUserType.enum.user,
    role: user.role
  })

  await expect(
    appClient.event.create.mutate(
      { transactionId: getUUID(), type: TENNIS_CLUB_MEMBERSHIP },
      { context: { headers: { authorization: tokenWithoutScope } } }
    )
  ).rejects.toMatchObject(new TRPCError({ code: 'FORBIDDEN' }))
})

test('Throws with unsigned forged token', async () => {
  expect(serverInstance).toBeDefined()
  expect(url).toBeDefined()

  const payload = getTokenPayload(createValidAppToken())
  const forgedToken = forgeUnsignedToken(payload)

  await expect(createEvent(forgedToken)).rejects.toMatchObject({
    data: { code: 'UNAUTHORIZED' }
  })
})

test('UNAUTHORIZED error is thrown when internal request is made without token', async () => {
  expect(serverInstance).toBeDefined()
  expect(url).toBeDefined()

  await expect(
    internalServiceClient.user.ping.query('ping')
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('UNAUTHORIZED error is thrown when request is made with valid APP token', async () => {
  expect(serverInstance).toBeDefined()
  expect(url).toBeDefined()

  await expect(
    internalServiceClient.user.ping.query('ping', {
      context: {
        headers: {
          authorization: `Bearer ${createValidAppToken()}`
        }
      }
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('UNAUTHORIZED error is thrown when internal request is made with token is not signed by the correct issuer', async () => {
  expect(serverInstance).toBeDefined()
  expect(url).toBeDefined()

  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const wrongPrivateKey = privateKey.export({ type: 'pkcs8', format: 'pem' })

  const forgedInternalServiceToken = jwt.sign({}, wrongPrivateKey, {
    subject: 'opencrvs:auth-service',
    algorithm: 'RS256',
    expiresIn: '1h',
    audience: ['opencrvs:events-user'],
    issuer: 'opencrvs:auth-service'
  })

  await expect(
    internalServiceClient.user.ping.query('ping', {
      context: {
        headers: {
          authorization: `Bearer ${forgedInternalServiceToken}`
        }
      }
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('API response is returned when internal request is made with valid token', async () => {
  expect(serverInstance).toBeDefined()
  expect(url).toBeDefined()

  const internalServiceToken = jwt.sign({}, cert, {
    subject: 'opencrvs:auth-service',
    algorithm: 'RS256',
    expiresIn: '1h',
    audience: ['opencrvs:events-user'],
    issuer: 'opencrvs:auth-service'
  })

  const response = await internalServiceClient.user.ping.query('ping', {
    context: {
      headers: {
        authorization: `Bearer ${internalServiceToken}`
      }
    }
  })

  expect(response).toEqual(`pong: ping`)
})

test('UNAUTHORIZED error is thrown when internal request is made with token is not signed with matching key', async () => {
  expect(serverInstance).toBeDefined()
  expect(url).toBeDefined()
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const wrongPrivateKey = privateKey.export({ type: 'pkcs8', format: 'pem' })
  const forgedInternalServiceToken = jwt.sign({}, wrongPrivateKey, {
    subject: 'opencrvs:auth-service',
    algorithm: 'RS256',
    expiresIn: '1h',
    audience: ['opencrvs:events-user'],
    issuer: 'opencrvs:auth-service'
  })
  await expect(
    internalServiceClient.user.ping.query('ping', {
      context: {
        headers: {
          authorization: `Bearer ${forgedInternalServiceToken}`
        }
      }
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})
test('API response is returned when internal request is made with valid token', async () => {
  expect(serverInstance).toBeDefined()
  expect(url).toBeDefined()
  const internalServiceToken = jwt.sign({}, cert, {
    subject: 'opencrvs:auth-service',
    algorithm: 'RS256',
    expiresIn: '1h',
    audience: ['opencrvs:events-user'],
    issuer: 'opencrvs:auth-service'
  })
  const response = await internalServiceClient.user.ping.query('ping', {
    context: {
      headers: {
        authorization: `Bearer ${internalServiceToken}`
      }
    }
  })
  expect(response).toEqual(`pong: ping`)
})
// ─── upstream failures ───────────────────────────────────────────────────────

describe('upstream error handling', () => {
  beforeAll(() => {
    // server is unreachable, e.g. due to network issues or the upstream service being down
    serverInstance.close()
  })
  test('propagates a TRPC error returned by the upstream service', async () => {
    await expect(
      createEvent(BearerTokenByUserType.localRegistrar)
    ).rejects.toMatchObject(new TRPCClientError('fetch failed'))
  })
})
