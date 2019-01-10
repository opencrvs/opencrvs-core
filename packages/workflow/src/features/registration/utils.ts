import * as ShortUIDGen from 'short-uid'
import { NOTIFICATION_SERVICE_URL } from 'src/constants'
import fetch from 'node-fetch'
import { logger } from 'src/logger'
import { getInformantName, getTrackingId } from './fhir/fhir-utils'

export function generateBirthTrackingId(): string {
  return generateTrackingId('B')
}

export function generateDeathTrackingId(): string {
  return generateTrackingId('D')
}

function generateTrackingId(prefix: string): string {
  return prefix.concat(new ShortUIDGen().randomUUID()).toUpperCase()
}

export async function sendBirthNotification(
  fhirBundle: fhir.Bundle,
  msisdn: string,
  authHeader: { Authorization: string }
) {
  try {
    await fetch(`${NOTIFICATION_SERVICE_URL}birthDeclarationSMS`, {
      method: 'POST',
      body: JSON.stringify({
        trackingid: getTrackingId(fhirBundle),
        msisdn,
        name: getInformantName(fhirBundle)
      }),
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      }
    })
  } catch (err) {
    logger.error(`Unable to send notification for error : ${err}`)
  }
}
