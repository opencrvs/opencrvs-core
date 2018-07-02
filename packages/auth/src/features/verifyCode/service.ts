import fetch from 'node-fetch'
import { stringify } from 'querystring'
import {
  CLICKATELL_USER,
  CLICKATELL_PASSWORD,
  CLICKATELL_API_ID
} from 'src/constants'
import { set, get } from 'src/database'

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
  const params = stringify({
    user: CLICKATELL_USER,
    password: CLICKATELL_PASSWORD,
    api_id: CLICKATELL_API_ID,
    to: mobile,
    text: verificationCode
  })

  await fetch(`https://api.clickatell.com/http/sendmsg?${params}`, {
    method: 'GET'
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
