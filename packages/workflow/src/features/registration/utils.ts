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
  authHeader: { Authorization: string }
) {
  const eventType = getEventType(fhirBundle)
  if (eventType === EVENT_TYPE.BIRTH) {
    sendNotification(fhirBundle, msisdn, 'birthDeclarationSMS', authHeader)
  } else {
    sendNotification(fhirBundle, msisdn, 'deathDeclarationSMS', authHeader)
  }
}

async function sendNotification(
  fhirBundle: fhir.Bundle,
  msisdn: string,
  smsType: string,
  authHeader: { Authorization: string }
) {
  try {
    await fetch(`${NOTIFICATION_SERVICE_URL}${smsType}`, {
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

export function getCompositionEventType(compoition: fhir.Composition) {
  const eventType =
    compoition &&
    compoition.type &&
    compoition.type.coding &&
    compoition.type.coding[0].code

  if (eventType === 'death-application') {
    return EVENT_TYPE.DEATH
  } else {
    return EVENT_TYPE.BIRTH
  }
}

export function getTaskEventType(task: fhir.Task) {
  const eventType =
    task && task.code && task.code.coding && task.code.coding[0].code

  if (eventType === EVENT_TYPE.DEATH) {
    return EVENT_TYPE.DEATH
  } else {
    return EVENT_TYPE.BIRTH
  }
}

export function getEventType(fhirBundle: fhir.Bundle) {
  if (fhirBundle.entry && fhirBundle.entry[0] && fhirBundle.entry[0].resource) {
    const firstEntry = fhirBundle.entry[0].resource
    if (firstEntry.resourceType === 'Composition') {
      return getCompositionEventType(firstEntry as fhir.Composition)
    } else {
      return getTaskEventType(firstEntry as fhir.Task)
    }
  }
  throw new Error('Invalid FHIR bundle found')
}
