import fetch from 'node-fetch'
import { USER_MANAGEMENT_URL } from '@auth/constants'
import { resolve } from 'url'

export interface IVerifyUser {
  mobile: string
  scope: string[]
  userId: string
}

export async function verifyUser(mobile: string): Promise<IVerifyUser> {
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
    mobile: body.mobile
  }
}
