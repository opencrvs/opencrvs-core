import fetch from 'node-fetch'

import { set, get } from 'src/database'
import { NOTIFICATION_SERVICE_URL } from 'src/constants'
import { resolve } from 'url'

export async function generateVerificationCode(nonce: string, mobile: string) {
  // TODO lets come back to how these are generated
  const code = Math.round(1000 + Math.random() * 8999).toString()

  await set(`verification_${nonce}`, code)
  return code
}
export function generateNonce() {
  return Math.round(1000 + Math.random() * 8999).toString()
}

export async function sendVerificationCode(
  mobile: string,
  verificationCode: string
): Promise<void> {
  const params = {
    msisdn: mobile,
    message: verificationCode
  }

  await fetch(resolve(NOTIFICATION_SERVICE_URL, 'sms'), {
    method: 'POST',
    body: JSON.stringify(params)
  })

  return undefined
}

export async function checkVerificationCode(
  nonce: string,
  code: string
): Promise<boolean> {
  const storedCode = await get(`verification_${nonce}`)
  return code === storedCode
}
