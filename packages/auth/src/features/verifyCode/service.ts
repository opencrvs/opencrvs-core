import { RedisClient } from 'redis'
import fetch from 'node-fetch'
import { stringify } from 'querystring'
import {
  CLICKATELL_USER,
  CLICKATELL_PASSWORD,
  CLICKATELL_API_ID
} from 'src/constants'

export async function generateVerificationCode(
  nonce: string,
  mobile: string,
  redisClient: RedisClient
) {
  // TODO lets come back to how these are generated
  const code = Math.round(1000 + Math.random() * 8999).toString()

  await redisClient.set(`verification_${nonce}`, code)
  return code
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
