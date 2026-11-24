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
  padRecoveryResponse,
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

  describe('reading a record back', () => {
    it('rejects a stored record whose status is not one this code knows', async () => {
      // What a rolling deploy looks like: a record written by a version that
      // had a status this one does not. Without validation it would flow on as
      // a half-typed object and only fail at whichever guard read `status`.
      await redis.setEx(
        'retrieval_step_tok-unknown-status',
        60,
        JSON.stringify({
          userId: '1',
          username: 'fake_user_name',
          userFullName: { firstname: 'Kennedy', surname: 'Mweene' },
          scope: ['demo'],
          securityQuestionKey: 'dummyKey',
          status: 'PHONE_VERIFIED_IN_SOME_OLD_RELEASE',
          retrieveFlow: 'password'
        })
      )

      await expect(
        getRetrievalStepInformation('tok-unknown-status')
      ).rejects.toThrow()
    })

    it('rejects a stored record missing a field the flow depends on', async () => {
      await redis.setEx(
        'retrieval_step_tok-no-question',
        60,
        JSON.stringify({
          userId: '1',
          username: 'fake_user_name',
          userFullName: { firstname: 'Kennedy', surname: 'Mweene' },
          scope: ['demo'],
          status: RetrievalSteps.WAITING_FOR_VERIFICATION
        })
      )

      await expect(
        getRetrievalStepInformation('tok-no-question')
      ).rejects.toThrow()
    })

    it('still accepts a record with no retrieveFlow, which is how links emailed before that field look', async () => {
      await redis.setEx(
        'retrieval_step_tok-legacy',
        60,
        JSON.stringify({
          userId: '1',
          username: 'fake_user_name',
          userFullName: { firstname: 'Kennedy', surname: 'Mweene' },
          scope: ['demo'],
          securityQuestionKey: 'dummyKey',
          status: RetrievalSteps.WAITING_FOR_VERIFICATION
        })
      )

      const record = await getRetrievalStepInformation('tok-legacy')

      expect(record.retrieveFlow).toBeUndefined()
    })
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

    const newNonce = await rotateRetrievalStepNonce('tok-2')

    expect(newNonce).not.toBe('tok-2')
    await expect(getRetrievalStepInformation('tok-2')).rejects.toThrow()
    const rotated = await getRetrievalStepInformation(newNonce)
    expect(rotated.userId).toBe('1')
    expect(rotated.retrieveFlow).toBe('password')
    expect(rotated.status).toBe(RetrievalSteps.NUMBER_VERIFIED)
  })

  it('throws when rotating a token that does not exist', async () => {
    await expect(rotateRetrievalStepNonce('never-stored')).rejects.toThrow()
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
      rotateRetrievalStepNonce('tok-race'),
      rotateRetrievalStepNonce('tok-race')
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

  describe('padRecoveryResponse', () => {
    it('waits out the remaining floor when the work finished early', async () => {
      const startedAt = Date.now()
      await padRecoveryResponse(startedAt, 120)

      expect(Date.now() - startedAt).toBeGreaterThanOrEqual(120)
    })

    it('returns without waiting once the floor has already passed', async () => {
      // A request slower than the floor must not be padded a second time —
      // that would stack the delay on exactly the requests already suffering.
      const startedAt = Date.now() - 5000
      const calledAt = Date.now()

      await padRecoveryResponse(startedAt, 120)

      // Only the jitter tail may remain, never another floor's worth.
      expect(Date.now() - calledAt).toBeLessThan(120)
    })
  })
})
