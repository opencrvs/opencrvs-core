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
import { redis } from '@auth/database'
import { UserName } from '@opencrvs/commons'
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
   * Which retrieval flow ('username' reminder or 'password' reset) this
   * token belongs to. Decided once, server-side, at /verifyUser time, and
   * carried on the record rather than the URL so a token holder cannot
   * rewrite it to receive a flow they were never sent.
   *
   * Optional because records written before this field existed (recovery
   * links already emailed pre-deploy) have no value here — callers reading
   * the record must treat a missing value as "unknown flow", never guess.
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
 * Makes an emailed recovery token single-use: the record moves to a fresh
 * nonce and the token the user clicked stops working immediately, so a link
 * left in browser history or a mail archive is inert.
 *
 * The old key is claimed with GETDEL — a single atomic read-and-delete —
 * rather than a separate get then del. Read-then-write-new-then-delete-old
 * left a window where two concurrent callers could both read the old
 * record before either deleted it, so both would rotate and two live
 * nonces would exist for one emailed token. GETDEL closes that window: only
 * one caller can ever win the old key, and a caller that loses the race
 * gets `null` and fails closed rather than rotating a token someone else
 * already claimed.
 *
 * `status` is the status to write on the new record, so the caller (e.g.
 * verifyRecoveryToken) can land the rotated record directly at its target
 * status in one write, instead of rotating into WAITING_FOR_VERIFICATION
 * and then immediately overwriting it.
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
