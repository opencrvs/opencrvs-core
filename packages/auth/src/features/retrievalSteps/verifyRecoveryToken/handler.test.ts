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
import * as Hapi from '@hapi/hapi'
import { AuthServer, createServer } from '@auth/server'
import {
  storeRetrievalStepInformation,
  RetrievalSteps,
  type RetrieveFlow
} from '@auth/features/retrievalSteps/verifyUser/service'
import verifyRecoveryTokenHandler from '@auth/features/retrievalSteps/verifyRecoveryToken/handler'

const seedRecord = {
  userId: '1',
  username: 'fake_user_name',
  userFullName: { firstname: '', surname: '' },
  mobile: '+8801711111111',
  email: undefined,
  securityQuestionKey: 'dummyKey',
  scope: ['demo'],
  retrieveFlow: 'password' as RetrieveFlow
}

async function seedWaitingForVerification(
  token: string,
  overrides: Partial<typeof seedRecord> = {}
) {
  await storeRetrievalStepInformation(
    token,
    RetrievalSteps.WAITING_FOR_VERIFICATION,
    { ...seedRecord, ...overrides }
  )
}

/**
 * Records written before the retrieveFlow field existed have no such
 * property at all (not merely undefined) — simulate that faithfully rather
 * than storing `retrieveFlow: undefined`, which JSON.stringify would also
 * drop, but which is clearer to express explicitly for a legacy-record test.
 */
async function seedLegacyRecordMissingRetrieveFlow(token: string) {
  const { retrieveFlow, ...legacyRecord } = seedRecord
  await storeRetrievalStepInformation(
    token,
    RetrievalSteps.WAITING_FOR_VERIFICATION,
    legacyRecord
  )
}

describe('verifyRecoveryToken handler receives a request', () => {
  let server: AuthServer

  beforeEach(async () => {
    server = await createServer()
  })

  it('returns a different nonce plus the securityQuestionKey for a valid, unused token', async () => {
    const token = 'recovery-token-valid'
    await seedWaitingForVerification(token)

    const res = await server.server.inject({
      method: 'POST',
      url: '/verifyRecoveryToken',
      payload: { token }
    })

    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.payload)
    expect(body.securityQuestionKey).toBe(seedRecord.securityQuestionKey)
    expect(body.nonce).toBeDefined()
    expect(body.nonce).not.toBe(token)
  })

  it('returns the retrieveFlow that was stored on the record', async () => {
    const passwordToken = 'recovery-token-password-flow'
    await seedWaitingForVerification(passwordToken, {
      retrieveFlow: 'password'
    })

    const passwordRes = await server.server.inject({
      method: 'POST',
      url: '/verifyRecoveryToken',
      payload: { token: passwordToken }
    })
    expect(JSON.parse(passwordRes.payload).retrieveFlow).toBe('password')

    const usernameToken = 'recovery-token-username-flow'
    await seedWaitingForVerification(usernameToken, {
      retrieveFlow: 'username'
    })

    const usernameRes = await server.server.inject({
      method: 'POST',
      url: '/verifyRecoveryToken',
      payload: { token: usernameToken }
    })

    // The username flow gets the same exchange as the password flow — a
    // rotated nonce and the security question — not a lesser response.
    const usernameBody = JSON.parse(usernameRes.payload)
    expect(usernameBody.retrieveFlow).toBe('username')
    expect(usernameBody.securityQuestionKey).toBe(
      seedRecord.securityQuestionKey
    )
    expect(usernameBody.nonce).toBeDefined()
    expect(usernameBody.nonce).not.toBe(usernameToken)
  })

  it('does not accept a caller-supplied retrieveFlow — the request schema has no such field', async () => {
    const token = 'recovery-token-injection-attempt'
    await seedWaitingForVerification(token, { retrieveFlow: 'password' })

    const res = await server.server.inject({
      method: 'POST',
      url: '/verifyRecoveryToken',
      // An attacker holding a password-reset link tries to smuggle in the
      // username flow to get a username they were never sent.
      payload: { token, retrieveFlow: 'username' }
    })

    // Rejected at validation before the handler ever runs, so there is no
    // path by which this field could reach — let alone override — the
    // response.
    expect(res.statusCode).toBe(400)
  })

  it('answers with the stored flow, not a smuggled one, when the handler is called past HTTP validation', async () => {
    const token = 'recovery-token-direct-injection-attempt'
    await seedWaitingForVerification(token, { retrieveFlow: 'password' })

    /*
     * Deliberately not a rejection test. The previous case covers the reject:
     * Joi answers 400 when `retrieveFlow` appears in the body over HTTP. This
     * one bypasses Joi by calling the handler function directly, so the schema
     * cannot be credited, and checks the weaker but more important property —
     * that the handler reads the flow from the stored record and never from
     * the payload. If it ever read the payload instead, the holder of a
     * password-reset link would receive the username flow here.
     */
    const response = (await verifyRecoveryTokenHandler(
      {
        payload: { token, retrieveFlow: 'username' }
      } as unknown as Hapi.Request,
      {} as Hapi.ResponseToolkit
    )) as { retrieveFlow: string }

    expect(response.retrieveFlow).toBe('password')
    expect(response.retrieveFlow).not.toBe('username')
  })

  it('rejects a legacy token whose record predates the retrieveFlow field', async () => {
    const token = 'recovery-token-legacy-no-flow'
    await seedLegacyRecordMissingRetrieveFlow(token)

    const res = await server.server.inject({
      method: 'POST',
      url: '/verifyRecoveryToken',
      payload: { token }
    })

    expect(res.statusCode).toBe(401)
  })

  it('rejects the same token used a second time', async () => {
    const token = 'recovery-token-reused'
    await seedWaitingForVerification(token)

    const firstRes = await server.server.inject({
      method: 'POST',
      url: '/verifyRecoveryToken',
      payload: { token }
    })
    expect(firstRes.statusCode).toBe(200)

    const secondRes = await server.server.inject({
      method: 'POST',
      url: '/verifyRecoveryToken',
      payload: { token }
    })
    expect(secondRes.statusCode).toBe(401)
  })

  it('rejects an unknown token', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/verifyRecoveryToken',
      payload: { token: 'recovery-token-never-issued' }
    })

    expect(res.statusCode).toBe(401)
  })

  it('returns byte-identical 401s for a replayed token and an unknown token', async () => {
    const token = 'recovery-token-for-identity-check'
    await seedWaitingForVerification(token)

    // Burn the token so the first call moves it out of WAITING_FOR_VERIFICATION.
    const usedRes = await server.server.inject({
      method: 'POST',
      url: '/verifyRecoveryToken',
      payload: { token }
    })
    expect(usedRes.statusCode).toBe(200)

    const replayedRes = await server.server.inject({
      method: 'POST',
      url: '/verifyRecoveryToken',
      payload: { token }
    })
    const unknownRes = await server.server.inject({
      method: 'POST',
      url: '/verifyRecoveryToken',
      payload: { token: 'recovery-token-that-was-never-issued' }
    })

    expect(replayedRes.statusCode).toBe(401)
    expect(unknownRes.statusCode).toBe(401)
    expect(replayedRes.statusCode).toBe(unknownRes.statusCode)
    expect(replayedRes.headers['content-type']).toBe(
      unknownRes.headers['content-type']
    )
    expect(replayedRes.payload).toBe(unknownRes.payload)
  })
})
