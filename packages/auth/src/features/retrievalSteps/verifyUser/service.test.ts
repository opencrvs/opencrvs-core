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

  it('rotates the nonce, preserving the record and killing the old key', async () => {
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
  })

  it('throws when rotating a token that does not exist', async () => {
    await expect(rotateRetrievalStepNonce('never-stored')).rejects.toThrow()
  })
})
