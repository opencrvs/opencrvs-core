import { query } from '@metrics/influxdb/client'

export async function fetchTotalSearchRequestByClientId(clientId: string) {
  return await query(
    `SELECT COUNT(clientId) FROM search_requests WHERE clientId = '${clientId}' AND time > now() - 1d`
  )
}
