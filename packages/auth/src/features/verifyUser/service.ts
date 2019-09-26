import fetch from 'node-fetch'
import { USER_MANAGEMENT_URL } from '@auth/constants'
import { resolve } from 'url'
import { IAuthentication } from '@auth/features/authenticate/service'
import { get, set, del } from '@auth/database'

export enum RetrievalSteps {
  WAITING_FOR_VERIFICATION = 'WAITING_FOR_VERIFICATION',
  NUMBER_VERIFIED = 'NUMBER_VERIFIED',
  SECURITY_Q_VERIFIED = 'SECURITY_Q_VERIFIED'
}
export interface IRetrievalStepInformation {
  userId: string
  scope: string[]
  mobile: string
  status: string
  question?: string
}

export async function verifyUser(mobile: string): Promise<IAuthentication> {
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
    scope: body.scope,
    status: body.status,
    mobile: body.mobile
  }
}

export async function storeRetrievalStepInformation(
  nonce: string,
  userId: string,
  scope: string[],
  mobile: string,
  status: RetrievalSteps,
  question?: string
) {
  return set(
    `retrieval_step_${nonce}`,
    JSON.stringify({
      userId,
      scope,
      mobile,
      status: status.toString(),
      question
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
