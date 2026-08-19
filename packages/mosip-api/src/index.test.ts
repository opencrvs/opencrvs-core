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
import { generateKeyPairSync } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { schemaJson as defaultSchemaJson } from './types/idSchemaJson'
import { initSqlite } from './database'

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
})

const createJwtPayload = () => ({
  scope: ['record.confirm-registration', 'record.reject-registration'],
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
const INVALID_JWT =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyZS1iaXJ0aCIsInJlY29yZC5kZWNsYXJlLWRlYXRoIiwicmVjb3JkLmRlY2xhcmUtbWFycmlhZ2UiLCJyZWNvcmQuZGVjbGFyYXRpb24tZWRpdCIsInJlY29yZC5kZWNsYXJhdGlvbi1zdWJtaXQtZm9yLXVwZGF0ZXMiLCJyZWNvcmQucmV2aWV3LWR1cGxpY2F0ZXMiLCJyZWNvcmQuZGVjbGFyYXRpb24tYXJjaGl2ZSIsInJlY29yZC5kZWNsYXJhdGlvbi1yZWluc3RhdGUiLCJyZWNvcmQucmVnaXN0ZXIiLCJyZWNvcmQucmVnaXN0cmF0aW9uLWNvcnJlY3QiLCJyZWNvcmQuZGVjbGFyYXRpb24tcHJpbnQtc3VwcG9ydGluZy1kb2N1bWVudHMiLCJyZWNvcmQuZXhwb3J0LXJlY29yZHMiLCJyZWNvcmQudW5hc3NpZ24tb3RoZXJzIiwicmVjb3JkLnJlZ2lzdHJhdGlvbi1wcmludCZpc3N1ZS1jZXJ0aWZpZWQtY29waWVzIiwicmVjb3JkLmNvbmZpcm0tcmVnaXN0cmF0aW9uIiwicmVjb3JkLnJlamVjdC1yZWdpc3RyYXRpb24iLCJwZXJmb3JtYW5jZS5yZWFkIiwicGVyZm9ybWFuY2UucmVhZC1kYXNoYm9hcmRzIiwicHJvZmlsZS5lbGVjdHJvbmljLXNpZ25hdHVyZSIsIm9yZ2FuaXNhdGlvbi5yZWFkLWxvY2F0aW9uczpteS1vZmZpY2UiLCJ1c2VyLnJlYWQ6bXktb2ZmaWNlIiwic2VhcmNoLmJpcnRoIiwic2VhcmNoLmRlYXRoIiwic2VhcmNoLm1hcnJpYWdlIiwiZGVtbyJdLCJpYXQiOjE3NDE3OTY0ODUsImV4cCI6MTc0MjQwMTI4NSwiYXVkIjpbIm9wZW5jcnZzOmF1dGgtdXNlciIsIm9wZW5jcnZzOnVzZXItbWdudC11c2VyIiwib3BlbmNydnM6aGVhcnRoLXVzZXIiLCJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJvcGVuY3J2czpub3RpZmljYXRpb24tdXNlciIsIm9wZW5jcnZzOndvcmtmbG93LXVzZXIiLCJvcGVuY3J2czpzZWFyY2gtdXNlciIsIm9wZW5jcnZzOm1ldHJpY3MtdXNlciIsIm9wZW5jcnZzOmNvdW50cnljb25maWctdXNlciIsIm9wZW5jcnZzOndlYmhvb2tzLXVzZXIiLCJvcGVuY3J2czpjb25maWctdXNlciIsIm9wZW5jcnZzOmRvY3VtZW50cy11c2VyIl0sImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjY3ZDE5NjE4OGE1MTU1NjU0NDVjYWUxNCJ9.hlVMc-lnU8UD4Mlpf3l-bpoVdbMiCbKQqfv3p1od4y6l7GDjWqIhna04jw7RtPMfx6mZva08E80T0j2fKwhb7bQO3R8ksvVeHaLrJJVd-l14HJpiW3DmbZ5I4IskB-1RY0Z_UXBhF9sMU-GBunS3jFR0CKDi2RdUBng9Arezp6n30PSc7d4OszJ6NVj3_nbXxekMH6G6kyoagGkfPaQFIYGLoDhC7Mpor9Mu8mkoS5W1Tiqq4aNbAJbiPlflrR5PSdu4nnJ9nQcpy48RQwZr4WR562Wydy8BtQa3Y9P_ZOC9y-3YnDAfGU657g9EoEww1E0dclp-hU54zNYUjfPCRA'

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
