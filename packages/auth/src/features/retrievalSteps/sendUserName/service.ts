import fetch from 'node-fetch'
import { NOTIFICATION_SERVICE_URL, JWT_ISSUER } from '@auth/constants'
import { resolve } from 'url'
import { createToken } from '@auth/features/authenticate/service'

export async function sendUserName(mobile: string, username: string) {
  const url = resolve(NOTIFICATION_SERVICE_URL, '/retrieveUserNameSMS')
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ msisdn: mobile, username }),
    headers: {
      Authorization: `Bearer ${await createToken(
        'auth',
        ['service'],
        ['opencrvs:notification-user'],
        JWT_ISSUER
      )}`
    }
  })

  if (res.status !== 200) {
    throw Error(`Unable to send username`)
  }
}
