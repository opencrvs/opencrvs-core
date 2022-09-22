import * as Hapi from '@hapi/hapi'
import { METRICS_URL } from '@workflow/constants'
import { logger } from '@workflow/logger'
import fetch from 'node-fetch'

export async function createUserAuditEvent(
  practitionerId: string,
  action: string,
  additionalData: Record<string, any>,
  request: Hapi.Request
) {
  const requestOpts = {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({
      practitionerId: practitionerId,
      action: action,
      additionalData: additionalData
    })
  }
  logger.info(`Writing a user audit event: ${requestOpts.body}`)

  return fetch(new URL('/audit/events', METRICS_URL).href, requestOpts)
}
