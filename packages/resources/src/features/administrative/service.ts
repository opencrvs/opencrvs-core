import fetch from 'node-fetch'
import { ADMINISTRATIVE_STRUCTURE_URL } from 'src/constants'
import { logger } from 'src/logger'

export async function getLocationData(route: string): Promise<void> {
  const url = `${ADMINISTRATIVE_STRUCTURE_URL}/${route}`
  logger.info('url', {
    url
  })
  const res = await fetch(url, {
    method: 'GET'
  })

  if (res.status !== 200) {
    throw Error(res.statusText)
  }

  const body = await res.json()
  return body
}
