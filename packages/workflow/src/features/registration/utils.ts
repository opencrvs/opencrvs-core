import * as ShortUIDGen from 'short-uid'
import { NOTIFICATION_SERVICE_URL } from 'src/constants'
import fetch from 'node-fetch'
import { logger } from 'src/logger'
import { getInformantName, getTrackingId } from './fhir/fhir-utils'
import { EVENT_TYPE } from './fhir/constants'

export function generateBirthTrackingId(): string {
  return generateTrackingId('B')
}

export function generateDeathTrackingId(): string {
  return generateTrackingId('D')
}

function generateTrackingId(prefix: string): string {
  return prefix.concat(new ShortUIDGen().randomUUID()).toUpperCase()
}

export function convertStringToASCII(str: string): string {
  return [...str]
    .map(char => char.charCodeAt(0).toString())
    .reduce((acc, v) => acc.concat(v))
}

export async function sendEventNotification(
  fhirBundle: fhir.Bundle,
  msisdn: string,
  eventType: EVENT_TYPE,
  authHeader: { Authorization: string }
) {
  if (eventType === EVENT_TYPE.BIRTH) {
    sendBirthNotification(fhirBundle, msisdn, authHeader)
  } else {
    sendDeathNotification(fhirBundle, msisdn, authHeader)
  }
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
export async function sendDeathNotification(
  fhirBundle: fhir.Bundle,
  msisdn: string,
  authHeader: { Authorization: string }
) {
  try {
    await fetch(`${NOTIFICATION_SERVICE_URL}deathDeclarationSMS`, {
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

export function getEventType(entry: fhir.Composition): EVENT_TYPE {
  const eventType =
    entry && entry.type && entry.type.coding && entry.type.coding[0].code

  if (eventType === 'birth-registration') {
    return EVENT_TYPE.BIRTH
  } else {
    return EVENT_TYPE.DEATH
  }
}
