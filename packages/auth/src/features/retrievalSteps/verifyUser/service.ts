import fetch from 'node-fetch'
import { USER_MANAGEMENT_URL } from '@auth/constants'
import { resolve } from 'url'
import { get, set, del } from '@auth/database'

export const RETRIEVAL_FLOW_USER_NAME = 'username'
export const RETRIEVAL_FLOW_PASSWORD = 'password'

export enum RetrievalSteps {
  WAITING_FOR_VERIFICATION = 'WAITING_FOR_VERIFICATION',
  NUMBER_VERIFIED = 'NUMBER_VERIFIED',
  SECURITY_Q_VERIFIED = 'SECURITY_Q_VERIFIED'
}
export interface IRetrievalStepInformation {
  userId: string
  username: string
  mobile: string
  status: string
  securityQuestionKey: string
}

export async function verifyUser(mobile: string) {
  const url = resolve(USER_MANAGEMENT_URL, '/verifyUser')

  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ mobile })
  })

  if (res.status !== 200) {
    throw Error(res.statusText)
  }

  const body = await res.json()
  return {
    userId: body.id,
    username: body.username,
    scope: body.scope,
    status: body.status,
    mobile: body.mobile,
    securityQuestionKey: body.securityQuestionKey
  }
}

export async function storeRetrievalStepInformation(
  nonce: string,
  userId: string,
  username: string,
  mobile: string,
  status: RetrievalSteps,
  securityQuestionKey: string
) {
  return set(
    `retrieval_step_${nonce}`,
    JSON.stringify({
      userId,
      username,
      mobile,
      status: status.toString(),
      securityQuestionKey
    })
  )
}

export async function getRetrievalStepInformation(
  nonce: string
): Promise<IRetrievalStepInformation> {
  const record = await get(`retrieval_step_${nonce}`)
  if (record === null) {
    throw new Error('password/username retrieval step information not found')
  }
  return JSON.parse(record)
}
export async function deleteRetrievalStepInformation(nonce: string) {
  await del(`retrieval_step_${nonce}`)
}
