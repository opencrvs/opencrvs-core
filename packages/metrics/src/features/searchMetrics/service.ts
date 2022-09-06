import { query } from '@metrics/influxdb/client'
import { getTokenPayload } from '@metrics/utils/authUtils'

export function getClientIdFromToken(token: string) {
  const payload = getTokenPayload(token)
  return payload.sub
}

export async function fetchTotalSearchRequestByClientId(clientId: string) {
  return await query(
    `SELECT COUNT(clientId) FROM search_requests WHERE clientId = '${clientId}' AND time > now() - 1d`
  )
}
