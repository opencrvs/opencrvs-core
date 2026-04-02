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
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import { env } from '@auth/environment'
import { redis } from '@auth/database'
import { IUserName } from '@opencrvs/commons'
import { AppRouter } from '@opencrvs/events/src/router'

export const RETRIEVAL_FLOW_USER_NAME = 'username'
export const RETRIEVAL_FLOW_PASSWORD = 'password'

export enum RetrievalSteps {
  WAITING_FOR_VERIFICATION = 'WAITING_FOR_VERIFICATION',
  NUMBER_VERIFIED = 'NUMBER_VERIFIED',
  SECURITY_Q_VERIFIED = 'SECURITY_Q_VERIFIED'
}

const eventsClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: env.EVENTS_URL,
      transformer: superjson
    })
  ]
})

export async function verifyUser(mobile?: string, email?: string) {
  const result = await eventsClient.user.verifyUser.mutate(
    mobile ? { mobile } : { email: email! }
  )

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
  userFullName: IUserName[]
  mobile?: string
  email?: string
  securityQuestionKey: string
  scope: string[]
  status: RetrievalSteps
}
export async function storeRetrievalStepInformation(
  nonce: string,
  status: RetrievalSteps,
  retrievalStepInformation: Omit<IRetrievalStepInformation, 'status'>
) {
  return redis.set(
    `retrieval_step_${nonce}`,
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
