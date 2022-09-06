import { query } from '@metrics/influxdb/client'
import { getTokenPayload } from '@metrics/utils/authUtils'
import { format } from 'date-fns'

export function getClientIdFromToken(token: string) {
  const payload = getTokenPayload(token)
  return payload.sub
}

export async function fetchTotalSearchRequestByClientId(clientId: string) {
  const currentDate = format(new Date(), 'yyyy-MM-dd')
  return await query(
    `SELECT COUNT(clientId) FROM search_requests WHERE clientId = '${clientId}' AND time >= '${currentDate}'`
  )
}
