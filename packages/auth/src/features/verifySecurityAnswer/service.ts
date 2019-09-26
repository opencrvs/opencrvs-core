import fetch from 'node-fetch'
import { USER_MANAGEMENT_URL } from '@auth/constants'
import { resolve } from 'url'

export async function verifySecurityAnswer(
  userId: string,
  questionKey: string,
  answer: string
): Promise<void> {
  const url = resolve(USER_MANAGEMENT_URL, '/verifySecurityAnswer')

  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ userId, questionKey, answer })
  })

  if (res.status !== 200) {
    throw Error(res.statusText)
  }
}
