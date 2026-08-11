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
import {
  storeRetrievalStepInformation,
  getRetrievalStepInformation,
  rotateRetrievalStepNonce,
  RetrievalSteps
} from '@auth/features/retrievalSteps/verifyUser/service'
import { redis } from '@auth/database'
import { env } from '@auth/environment'

describe('verifyUser service', () => {
  it('stores a retrieval step with the recovery link expiry', async () => {
    await storeRetrievalStepInformation(
      'tok-1',
      RetrievalSteps.WAITING_FOR_VERIFICATION,
      {
        userId: '1',
        username: 'fake_user_name',
        userFullName: { firstname: 'Kennedy', surname: 'Mweene' },
        scope: ['demo'],
        mobile: '+8801711111111',
        email: undefined,
        securityQuestionKey: 'dummyKey'
      }
    )

    expect(redis.setEx).toHaveBeenCalledWith(
      'retrieval_step_tok-1',
      env.CONFIG_RECOVERY_LINK_EXPIRY_SECONDS,
      expect.any(String)
    )
    expect(redis.set).not.toHaveBeenCalled()
  })

  it('rotates the nonce, preserving the record, killing the old key, and writing the target status', async () => {
    await storeRetrievalStepInformation(
      'tok-2',
      RetrievalSteps.WAITING_FOR_VERIFICATION,
      {
        userId: '1',
        username: 'fake_user_name',
        userFullName: { firstname: 'Kennedy', surname: 'Mweene' },
        scope: ['demo'],
        mobile: '+8801711111111',
        email: undefined,
        securityQuestionKey: 'dummyKey',
        retrieveFlow: 'password'
      }
    )

    const newNonce = await rotateRetrievalStepNonce(
      'tok-2',
      RetrievalSteps.NUMBER_VERIFIED
    )

    expect(newNonce).not.toBe('tok-2')
    await expect(getRetrievalStepInformation('tok-2')).rejects.toThrow()
    const rotated = await getRetrievalStepInformation(newNonce)
    expect(rotated.userId).toBe('1')
    expect(rotated.retrieveFlow).toBe('password')
    expect(rotated.status).toBe(RetrievalSteps.NUMBER_VERIFIED)
  })

  it('throws when rotating a token that does not exist', async () => {
    await expect(
      rotateRetrievalStepNonce('never-stored', RetrievalSteps.NUMBER_VERIFIED)
    ).rejects.toThrow()
  })

  it('claims the old key atomically: a second rotation of the same nonce fails closed rather than producing two live nonces', async () => {
    await storeRetrievalStepInformation(
      'tok-race',
      RetrievalSteps.WAITING_FOR_VERIFICATION,
      {
        userId: '1',
        username: 'fake_user_name',
        userFullName: { firstname: 'Kennedy', surname: 'Mweene' },
        scope: ['demo'],
        mobile: '+8801711111111',
        email: undefined,
        securityQuestionKey: 'dummyKey',
        retrieveFlow: 'password'
      }
    )

    /*
     * Two concurrent exchanges of the same emailed token, racing to claim it.
     * The in-memory `getDel` in test/setupJest.ts reads and deletes in one
     * synchronous body, so it grants the key to exactly one caller the way the
     * real command does. A mock that awaited between the read and the delete
     * would let both callers win and this test would stop meaning anything.
     */
    const [first, second] = await Promise.allSettled([
      rotateRetrievalStepNonce('tok-race', RetrievalSteps.NUMBER_VERIFIED),
      rotateRetrievalStepNonce('tok-race', RetrievalSteps.NUMBER_VERIFIED)
    ])

    const outcomes = [first, second]
    const winners = outcomes.filter((o) => o.status === 'fulfilled')
    const losers = outcomes.filter((o) => o.status === 'rejected')

    // Exactly one caller wins the race; the other fails closed instead of
    // also rotating, which is what would produce two live nonces for one
    // emailed token.
    expect(winners).toHaveLength(1)
    expect(losers).toHaveLength(1)

    const winningNonce = (winners[0] as PromiseFulfilledResult<string>).value
    const winningRecord = await getRetrievalStepInformation(winningNonce)
    expect(winningRecord.status).toBe(RetrievalSteps.NUMBER_VERIFIED)
  })
})
