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
import { encodeScope, TokenUserType } from '@opencrvs/commons'
import { AuthServer, createServer } from '@auth/server'
import { createToken } from '@auth/features/authenticate/service'
import { env } from '@auth/environment'

const EVENT_ID = '11111111-1111-1111-1111-111111111111'
const ACTION_ID = '22222222-2222-2222-2222-222222222222'

const decodeTokenPayload = (token: string) =>
  JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())

const exchangeRequest = (subjectToken: string) => ({
  method: 'POST' as const,
  url: '/token',
  payload: {
    grant_type: 'urn:opencrvs:oauth:grant-type:token-exchange',
    subject_token: subjectToken,
    subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
    requested_token_type: 'urn:opencrvs:oauth:token-type:single_record_token',
    event_id: EVENT_ID,
    action_id: ACTION_ID
  }
})

describe('token exchange for action confirmation', () => {
  let server: AuthServer

  beforeEach(async () => {
    server = await createServer()
  })

  it('issues a confirmation token bound to the event and action', async () => {
    const subjectToken = await createToken(
      'user-id',
      [encodeScope({ type: 'record.register' })],
      ['opencrvs:auth-user'],
      'opencrvs:auth-service',
      undefined,
      TokenUserType.enum.user
    )

    const res = await server.server.inject(exchangeRequest(subjectToken))

    expect(res.statusCode).toBe(200)

    const payload = decodeTokenPayload(JSON.parse(res.payload).access_token)
    expect(payload.scope).toEqual(
      expect.arrayContaining([
        encodeScope({ type: 'record.confirm-registration' }),
        encodeScope({ type: 'record.reject-registration' })
      ])
    )
    expect(payload.sub).toBe('user-id')
    expect(payload.eventId).toBe(EVENT_ID)
    expect(payload.actionId).toBe(ACTION_ID)
    expect(payload.userType).toBe('user')
  })

  it('keeps a system subject resolved as a system in the confirmation token', async () => {
    // e.g. a third-party integration (MOSIP) confirming a registration with
    // its own client_credentials token — the confirmation must be resolved
    // and audited as the system client, not as a user
    const subjectToken = await createToken(
      'system-id',
      [encodeScope({ type: 'record.register' })],
      ['opencrvs:auth-user'],
      'opencrvs:auth-service',
      undefined,
      TokenUserType.enum.system
    )

    const res = await server.server.inject(exchangeRequest(subjectToken))

    expect(res.statusCode).toBe(200)

    const payload = decodeTokenPayload(JSON.parse(res.payload).access_token)
    expect(payload.sub).toBe('system-id')
    expect(payload.userType).toBe('system')
  })

  it('defaults to a user subject when the token carries no userType claim', async () => {
    const subjectToken = jwt.sign(
      { scope: ['record.register'] },
      readFileSync(env.CERT_PRIVATE_KEY_PATH),
      {
        subject: 'legacy-subject',
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: ['opencrvs:auth-user'],
        expiresIn: '1h'
      }
    )

    const res = await server.server.inject(exchangeRequest(subjectToken))

    expect(res.statusCode).toBe(200)

    const payload = decodeTokenPayload(JSON.parse(res.payload).access_token)
    expect(payload.userType).toBe('user')
  })

  it('rejects an invalid subject token', async () => {
    const res = await server.server.inject(exchangeRequest('not-a-token'))

    expect(res.statusCode).toBe(401)
  })
})
