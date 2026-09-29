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
import test from 'node:test'
import assert from 'node:assert'
import { buildFastify } from './index'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { env, OPENCRVS_PUBLIC_KEY_URL } from './constants'
import { createHmac, generateKeyPairSync } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { schemaJson as defaultSchemaJson } from './types/idSchemaJson'
import { initSqlite } from './database'

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
})

const createJwtPayload = () => ({
  scope: ['record.register'],
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  aud: ['opencrvs:auth-user'],
  iss: 'opencrvs:auth-service',
  sub: `${Date.now()}-${Math.random().toString(36).slice(2)}`
})

const createPacketRequests: Array<{
  request: {
    schemaJson: string
    process: string
    fields: Record<string, unknown>
  }
}> = []

const mswServer = setupServer(
  http.get(OPENCRVS_PUBLIC_KEY_URL, () => {
    return HttpResponse.text(publicKey)
  }),
  http.post(env.MOSIP_AUTH_URL, () => {
    return new HttpResponse(null, {
      headers: {
        'Set-Cookie': 'Authorization=test-auth-token; Path=/; HttpOnly'
      }
    })
  }),
  http.put(env.MOSIP_CREATE_PACKET_URL, async ({ request }) => {
    createPacketRequests.push(
      (await request.json()) as {
        request: {
          schemaJson: string
          process: string
          fields: Record<string, unknown>
        }
      }
    )
    return HttpResponse.json({ response: { id: 'ok' } })
  }),
  http.post(env.MOSIP_PROCESS_PACKET_URL, () => {
    return HttpResponse.json({ errors: [] })
  })
)
mswServer.listen()

const createValidJwt = () =>
  jwt.sign(createJwtPayload(), privateKey, { algorithm: 'RS256' })
// Well-formed, but its signature belongs to another payload (each has a unique `sub`)
const [jwtHeader, jwtPayload] = createValidJwt().split('.')
const [, , otherJwtSignature] = createValidJwt().split('.')
const INVALID_JWT = `${jwtHeader}.${jwtPayload}.${otherJwtSignature}`

test('validates JWTs', async (t) => {
  const { database } = initSqlite(':memory:')
  const fastify = await buildFastify()
  await fastify.ready()

  await t.test('should reject an invalid JWT', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/events/registration',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${INVALID_JWT}`
      },
      body: JSON.stringify({
        eventId: '11111111-1111-1111-1111-111111111111',
        trackingId: 'tracking-id-1',
        notification: {
          recipientFullName: 'Jane Doe',
          recipientEmail: 'jane@example.com',
          recipientPhone: '+1555000111'
        },
        requestFields: {
          birthCertificateNumber: 'BCN-INVALID-JWT'
        },
        metaInfo: {},
        audit: {}
      })
    })

    assert.strictEqual(response.statusCode, 401)
  })

  await t.test(
    'should accept a valid JWT and fallback to default schemaJson',
    async () => {
      createPacketRequests.length = 0

      const response = await fastify.inject({
        method: 'POST',
        url: '/events/registration',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${createValidJwt()}`
        },
        body: JSON.stringify({
          eventId: '22222222-2222-2222-2222-222222222222',
          trackingId: 'tracking-id-default-schema',
          notification: {
            recipientFullName: 'Jane Doe',
            recipientEmail: 'jane@example.com',
            recipientPhone: '+1555000112'
          },
          requestFields: {
            birthCertificateNumber: 'BCN-DEFAULT-SCHEMA'
          },
          metaInfo: {},
          audit: {}
        })
      })

      assert.strictEqual(response.statusCode, 202)
      assert.strictEqual(createPacketRequests.length, 1)
      assert.strictEqual(
        createPacketRequests[0]?.request?.schemaJson,
        defaultSchemaJson
      )
    }
  )

  await t.test('should use schemaJson from payload when provided', async () => {
    createPacketRequests.length = 0
    const customSchemaJson = '{"title":"custom schema"}'

    const response = await fastify.inject({
      method: 'POST',
      url: '/events/registration',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${createValidJwt()}`
      },
      body: JSON.stringify({
        eventId: '33333333-3333-3333-3333-333333333333',
        trackingId: 'tracking-id-custom-schema',
        notification: {
          recipientFullName: 'Jane Doe',
          recipientEmail: 'jane@example.com',
          recipientPhone: '+1555000113'
        },
        requestFields: {
          birthCertificateNumber: 'BCN-CUSTOM-SCHEMA'
        },
        schemaJson: customSchemaJson,
        metaInfo: {},
        audit: {}
      })
    })

    assert.strictEqual(response.statusCode, 202)
    assert.strictEqual(createPacketRequests.length, 1)
    assert.strictEqual(
      createPacketRequests[0]?.request?.schemaJson,
      customSchemaJson
    )
  })

  await t.test(
    'should accept correction updates and send CRVS_UPDATE process',
    async () => {
      createPacketRequests.length = 0

      const response = await fastify.inject({
        method: 'POST',
        url: '/events/update-biographics',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${createValidJwt()}`
        },
        body: JSON.stringify({
          trackingId: 'tracking-id-correction',
          notification: {
            recipientFullName: 'Jane Doe',
            recipientEmail: 'jane@example.com',
            recipientPhone: '+1555000114'
          },
          requestFields: {
            VID: '8031687218',
            fullName: 'Infant Updated',
            dateOfBirth: '2024-01-01',
            gender: 'male'
          },
          metaInfo: {},
          audit: {}
        })
      })

      assert.strictEqual(response.statusCode, 202)
      assert.strictEqual(createPacketRequests.length, 1)
      assert.strictEqual(
        createPacketRequests[0]?.request?.process,
        'CRVS_UPDATE'
      )
      assert.strictEqual(
        createPacketRequests[0]?.request?.fields?.VID,
        '8031687218'
      )
    }
  )

  await fastify.close()
  database.close()
})

test('authenticates WebSub callbacks', async (t) => {
  const { database } = initSqlite(':memory:')
  const fastify = await buildFastify()
  await fastify.ready()

  // The route is exempt from JWT auth, so the hub signature is the only thing
  // standing between an unauthenticated caller and a confirmed registration.
  const body = JSON.stringify({ not: 'a real credential envelope' })
  const sign = (payload: string, secret = env.MOSIP_WEBSUB_SECRET) =>
    `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`

  const post = (headers: Record<string, string>) =>
    fastify.inject({
      method: 'POST',
      url: '/websub/callback',
      headers: { 'Content-Type': 'application/json', ...headers },
      body
    })

  await t.test('rejects an unsigned callback', async () => {
    const response = await post({})
    assert.strictEqual(response.statusCode, 401)
  })

  await t.test('rejects a callback signed with the wrong secret', async () => {
    const response = await post({
      'X-Hub-Signature': sign(body, 'not-the-hub-secret')
    })
    assert.strictEqual(response.statusCode, 401)
  })

  await t.test(
    'rejects a callback whose body was altered in transit',
    async () => {
      const response = await post({ 'X-Hub-Signature': sign(`${body} `) })
      assert.strictEqual(response.statusCode, 401)
    }
  )

  // Anything but 401 proves the signature gate passed and the request moved on.
  // What it then fails on is not this test's concern — the body is bogus.
  await t.test(
    'lets a correctly signed callback through the gate',
    async () => {
      const response = await post({ 'X-Hub-Signature': sign(body) })
      assert.notStrictEqual(response.statusCode, 401)
    }
  )

  await fastify.close()
  database.close()
})
