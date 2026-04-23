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

import { TRPCError } from '@trpc/server'
import { sql } from 'kysely'
import { getUUID } from '@opencrvs/commons'
import { createInternalTestClient, setupTestCase } from '@events/tests/utils'
import { generateHash, generateSaltedHash } from '@events/service/auth/hash'

const caller = createInternalTestClient()

test('returns UNAUTHORIZED when user not found', async () => {
  await expect(
    caller.user.verifySecurityAnswer({
      userId: getUUID(),
      questionKey: 'BIRTH_TOWN',
      answer: 'London'
    })
  ).rejects.toMatchObject(new TRPCError({ code: 'UNAUTHORIZED' }))
})

test('returns CONFLICT when user has no security questions', async () => {
  const { eventsDb, user } = await setupTestCase()

  await eventsDb
    .updateTable('userCredentials')
    .set({
      securityQuestions:
        sql`cast (${JSON.stringify([])} as jsonb)` as unknown as Record<
          string,
          unknown
        >
    })
    .where('userId', '=', user.id)
    .execute()

  await expect(
    caller.user.verifySecurityAnswer({
      userId: user.id,
      questionKey: 'BIRTH_TOWN',
      answer: 'London'
    })
  ).rejects.toMatchObject(
    new TRPCError({
      code: 'CONFLICT',
      message: "User doesn't have security questions"
    })
  )
})

test('returns matched: false when question key is not in user questions', async () => {
  const { eventsDb, user } = await setupTestCase()
  const { salt } = await generateSaltedHash('irrelevant')
  const answerHash = await generateHash('london', salt)

  await eventsDb
    .updateTable('userCredentials')
    .set({
      salt,
      securityQuestions: sql`cast (${JSON.stringify([
        { questionKey: 'BIRTH_TOWN', answerHash }
      ])} as jsonb)` as unknown as Record<string, unknown>
    })
    .where('userId', '=', user.id)
    .execute()

  const result = await caller.user.verifySecurityAnswer({
    userId: user.id,
    questionKey: 'UNKNOWN_QUESTION',
    answer: 'london'
  })

  expect(result.matched).toBe(false)
  expect(result.questionKey).toBe('UNKNOWN_QUESTION')
})

test('returns matched: false and rotates to fallback question when answer is wrong', async () => {
  const { eventsDb, user } = await setupTestCase()
  const { salt } = await generateSaltedHash('irrelevant')
  const answerHash = await generateHash('london', salt)

  await eventsDb
    .updateTable('userCredentials')
    .set({
      salt,
      securityQuestions: sql`cast (${JSON.stringify([
        { questionKey: 'BIRTH_TOWN', answerHash },
        { questionKey: 'FIRST_CHILD_NAME', answerHash: 'other-hash' }
      ])} as jsonb)` as unknown as Record<string, unknown>
    })
    .where('userId', '=', user.id)
    .execute()

  const result = await caller.user.verifySecurityAnswer({
    userId: user.id,
    questionKey: 'BIRTH_TOWN',
    answer: 'wronganswer'
  })

  expect(result.matched).toBe(false)
  expect(result.questionKey).toBe('FIRST_CHILD_NAME')
})

test('returns matched: true when answer is correct', async () => {
  const { eventsDb, user } = await setupTestCase()
  const { salt } = await generateSaltedHash('irrelevant')
  const answerHash = await generateHash('london', salt)

  await eventsDb
    .updateTable('userCredentials')
    .set({
      salt,
      securityQuestions: sql`cast (${JSON.stringify([
        { questionKey: 'BIRTH_TOWN', answerHash }
      ])} as jsonb)` as unknown as Record<string, unknown>
    })
    .where('userId', '=', user.id)
    .execute()

  const result = await caller.user.verifySecurityAnswer({
    userId: user.id,
    questionKey: 'BIRTH_TOWN',
    answer: 'London'
  })

  expect(result.matched).toBe(true)
  expect(result.questionKey).toBe('BIRTH_TOWN')
})
