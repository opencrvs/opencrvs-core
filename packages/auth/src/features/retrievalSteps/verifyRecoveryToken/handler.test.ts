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
import { AuthServer, createServer } from '@auth/server'
import {
  storeRetrievalStepInformation,
  RetrievalSteps
} from '@auth/features/retrievalSteps/verifyUser/service'

const seedRecord = {
  userId: '1',
  username: 'fake_user_name',
  userFullName: { firstname: '', surname: '' },
  mobile: '+8801711111111',
  email: undefined,
  securityQuestionKey: 'dummyKey',
  scope: ['demo']
}

async function seedWaitingForVerification(token: string) {
  await storeRetrievalStepInformation(
    token,
    RetrievalSteps.WAITING_FOR_VERIFICATION,
    seedRecord
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
    expect(body.securityQuestionKey).toBe('dummyKey')
    expect(body.nonce).toBeDefined()
    expect(body.nonce).not.toBe(token)
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
