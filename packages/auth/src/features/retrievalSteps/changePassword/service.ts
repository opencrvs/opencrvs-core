import fetch from 'node-fetch'
import { USER_MANAGEMENT_URL } from '@auth/constants'
import { resolve } from 'url'

export async function changePassword(userId: string, password: string) {
  const url = resolve(USER_MANAGEMENT_URL, '/changePassword')

  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ userId, password })
  })

  if (res.status !== 200) {
    throw Error(res.statusText)
  }
}
