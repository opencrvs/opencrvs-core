import { AUTH_URL } from '@gateway/constants'
import { logger } from '@opencrvs/commons'

export default async function getPublicKey(): Promise<string> {
  const authUrl = new URL('/.well-known', AUTH_URL)
  const res = await fetch(authUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (!res.ok) {
    logger.error(await res.text())
    throw new Error(
      `Error occured when calling getPublicKey endpoint [${res.statusText} ${
        res.status
      }]: ${await res.text()}`
    )
  }
  return await res.text()
}
