import fetch from 'node-fetch'
import { getEventType } from '@workflow/features/registration/utils'
import { ValidRecord } from '@opencrvs/commons/types'
import { METRICS_URL } from '@workflow/constants'

export async function createNewAuditEvent(
  bundle: ValidRecord,
  authToken: string
) {
  const eventType = getEventType(bundle).toLowerCase()

  const res = await fetch(
    new URL(`/events/${eventType}/request-correction`, METRICS_URL).href,
    {
      method: 'POST',
      body: JSON.stringify(bundle),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    }
  )
  if (!res.ok) {
    throw new Error(
      `Writing an audit event to metrics failed with [${
        res.status
      }] body: ${await res.text()}`
    )
  }

  return res
}
