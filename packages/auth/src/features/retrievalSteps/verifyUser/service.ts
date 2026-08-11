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
import * as crypto from 'crypto'
import { redis } from '@auth/database'
import { logger, UserName } from '@opencrvs/commons'
import { internalClient } from '@auth/features/authenticate/service'
import { generateNonce } from '@auth/features/verifyCode/service'
import { env } from '@auth/environment'

export const RETRIEVAL_FLOW_USER_NAME = 'username'
export const RETRIEVAL_FLOW_PASSWORD = 'password'

export type RetrieveFlow =
  | typeof RETRIEVAL_FLOW_USER_NAME
  | typeof RETRIEVAL_FLOW_PASSWORD

export enum RetrievalSteps {
  WAITING_FOR_VERIFICATION = 'WAITING_FOR_VERIFICATION',
  NUMBER_VERIFIED = 'NUMBER_VERIFIED',
  SECURITY_Q_VERIFIED = 'SECURITY_Q_VERIFIED'
}

export async function verifyUser(input: { mobile?: string; email?: string }) {
  const result = await internalClient.user.verifyUser.mutate(input)

  return {
    userId: result.id,
    username: result.username,
    userFullName: result.name,
    scope: result.scope,
    status: result.status,
    mobile: result.mobile,
    email: result.email,
    securityQuestionKey: result.securityQuestionKey
  }
}

export interface IRetrievalStepInformation {
  userId: string
  username: string
  userFullName: UserName
  mobile?: string
  email?: string
  securityQuestionKey: string
  scope: string[]
  status: RetrievalSteps
  /**
   * Decided server-side at /verifyUser time and kept off the URL, so a token
   * holder cannot rewrite it into a flow they were never sent. Optional only
   * because links emailed before this field existed lack it — treat a missing
   * value as unknown, never guess.
   */
  retrieveFlow?: RetrieveFlow
}
export async function storeRetrievalStepInformation(
  nonce: string,
  status: RetrievalSteps,
  retrievalStepInformation: Omit<IRetrievalStepInformation, 'status'>
) {
  return redis.setEx(
    `retrieval_step_${nonce}`,
    env.CONFIG_RECOVERY_LINK_EXPIRY_SECONDS,
    JSON.stringify({ ...retrievalStepInformation, status })
  )
}

export async function getRetrievalStepInformation(
  nonce: string
): Promise<IRetrievalStepInformation & { status: RetrievalSteps }> {
  const record = await redis.get(`retrieval_step_${nonce}`)
  if (record === null) {
    throw new Error('password/username retrieval step information not found')
  }
  return JSON.parse(record)
}
export async function deleteRetrievalStepInformation(nonce: string) {
  await redis.del(`retrieval_step_${nonce}`)
}

/**
 * Duration every /verifyUser response is held to. Has to stay above the
 * slowest real path — a user lookup plus a Redis write — or the padding stops
 * hiding anything, which `padRecoveryResponse` warns about when it happens.
 * Not configurable on purpose: a deployment that lowered it would silently
 * reopen the timing oracle.
 */
export const RECOVERY_RESPONSE_FLOOR_MS = 500

/**
 * Width of the random tail added on top of the floor. Its only job is to stop
 * the padded duration from being a single crisp number an attacker can
 * subtract; the floor is what actually hides the work.
 */
const RECOVERY_RESPONSE_JITTER_MS = 50

/**
 * Holds a /verifyUser response until a constant floor has passed, then adds a
 * random tail.
 *
 * Doing equal work on both paths is not enough on its own: a dependency that
 * fails fast and consistently — the events service being down, a lookup
 * rejecting before it touches the database — returns sooner than a successful
 * lookup does, and a caller who times enough requests can read the account's
 * existence straight off that gap. Padding to a floor closes it without the
 * handler having to reason about which calls it would otherwise skip.
 *
 * Jitter alone would not do: random noise around two different means still
 * leaks the means once an attacker averages enough samples. The floor is the
 * defence, the jitter only denies a trivially readable constant.
 */
export async function padRecoveryResponse(
  startedAt: number,
  floorMs = RECOVERY_RESPONSE_FLOOR_MS
) {
  const elapsed = Date.now() - startedAt
  const target = floorMs + crypto.randomInt(0, RECOVERY_RESPONSE_JITTER_MS + 1)

  if (elapsed > floorMs) {
    // Past the floor the response time is the real work again, so the padding
    // has stopped hiding anything. Raise the floor or find what got slow.
    logger.warn(
      `padRecoveryResponse: request took ${elapsed}ms, over the ${floorMs}ms floor`
    )
  }

  const remaining = target - elapsed
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining))
  }
}

/**
 * Makes an emailed token single-use: the record moves to a fresh nonce, so a
 * link left in browser history or a mail archive is inert.
 *
 * GETDEL claims the old key atomically. A separate get-then-delete let two
 * concurrent callers both read it and both rotate, leaving two live nonces for
 * one token; now the loser gets null and fails closed.
 *
 * `status` lands the rotated record at its target in one write.
 */
export async function rotateRetrievalStepNonce(
  oldNonce: string,
  status: RetrievalSteps
) {
  const raw = await redis.getDel(`retrieval_step_${oldNonce}`)
  if (raw === null) {
    throw new Error('password/username retrieval step information not found')
  }
  const record: IRetrievalStepInformation = JSON.parse(raw)
  const newNonce = generateNonce()
  await redis.setEx(
    `retrieval_step_${newNonce}`,
    env.CONFIG_RECOVERY_LINK_EXPIRY_SECONDS,
    JSON.stringify({ ...record, status })
  )
  return newNonce
}
