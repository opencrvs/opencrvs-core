import fetch from 'node-fetch'
import { USER_MANAGEMENT_URL } from '@auth/constants'
import { resolve } from 'url'
import { set, get } from '@auth/database'

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

interface ICodeDetails {
  code: string
  userId: string
  createdAt: number
}

export async function storePasswordChangeCode(
  nonce: string,
  code: string,
  userId: string
) {
  const codeDetails = {
    code,
    userId,
    createdAt: Date.now()
  }

  await set(`password_change_code_${nonce}`, JSON.stringify(codeDetails))
}

export async function getPasswordChangeCodeDetails(
  nonce: string
): Promise<ICodeDetails> {
  const codeDetails = await get(`password_change_code_${nonce}`)
  return JSON.parse(codeDetails) as ICodeDetails
}
