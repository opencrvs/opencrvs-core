import * as ShortUIDGen from 'short-uid'
import {
  NOTIFICATION_SERVICE_URL,
  RESOURCE_SERVICE_URL
} from '@workflow/constants'
import fetch from 'node-fetch'
import { logger } from '@workflow/logger'
import {
  getInformantName,
  getTrackingId
} from '@workflow/features/registration/fhir/fhir-utils'
import {
  EVENT_TYPE,
  CHILD_SECTION_CODE,
  DECEASED_SECTION_CODE
} from '@workflow/features/registration/fhir/constants'
import { Events } from '@workflow/features/events/handler'

interface INotificationPayload {
  msisdn: string
  name: string
  trackingid?: string
}

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
  event: Events,
  msisdn: string,
  authHeader: { Authorization: string }
) {
  logger.info(`sendEventNotification method for event: ${event}`)
  // tslint:disable-next-line
  switch (event) {
    case Events.BIRTH_NEW_DEC:
      await sendNotification(
        'birthDeclarationSMS',
        msisdn,
        await getInformantName(fhirBundle, CHILD_SECTION_CODE),
        authHeader,
        getTrackingId(fhirBundle)
      )
      break
    case Events.BIRTH_NEW_REG:
    case Events.BIRTH_MARK_REG:
      await sendNotification(
        'birthRegistrationSMS',
        msisdn,
        await getInformantName(fhirBundle, CHILD_SECTION_CODE),
        authHeader
      )
      break
    case Events.BIRTH_MARK_VOID:
      await sendNotification(
        'birthRejectionSMS',
        msisdn,
        await getInformantName(fhirBundle, CHILD_SECTION_CODE),
        authHeader,
        getTrackingId(fhirBundle)
      )
      break
    case Events.DEATH_NEW_DEC:
      await sendNotification(
        'deathDeclarationSMS',
        msisdn,
        await getInformantName(fhirBundle, DECEASED_SECTION_CODE),
        authHeader,
        getTrackingId(fhirBundle)
      )
      break
    case Events.DEATH_NEW_REG:
    case Events.DEATH_MARK_REG:
      await sendNotification(
        'deathRegistrationSMS',
        msisdn,
        await getInformantName(fhirBundle, DECEASED_SECTION_CODE),
        authHeader
      )
      break
    case Events.DEATH_MARK_VOID:
      await sendNotification(
        'deathRejectionSMS',
        msisdn,
        await getInformantName(fhirBundle, DECEASED_SECTION_CODE),
        authHeader,
        getTrackingId(fhirBundle)
      )
  }
}

async function sendNotification(
  smsType: string,
  msisdn: string,
  name: string,
  authHeader: { Authorization: string },
  trackingId?: string
) {
  const payload: INotificationPayload = {
    msisdn,
    name
  }
  if (trackingId) {
    payload.trackingid = trackingId
  }
  logger.info(
    `Sending sms to : ${NOTIFICATION_SERVICE_URL}${smsType} with body: ${JSON.stringify(
      payload
    )}`
  )
  try {
    await fetch(`${NOTIFICATION_SERVICE_URL}${smsType}`, {
      method: 'POST',
      body: JSON.stringify(payload),
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

  if (eventType === 'death-declaration') {
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

export function isInProgressApplication(fhirBundle: fhir.Bundle) {
  const taskEntry =
    fhirBundle &&
    fhirBundle.entry &&
    fhirBundle.entry.find(
      entry => entry.resource && entry.resource.resourceType === 'Task'
    )

  return (
    (taskEntry &&
      taskEntry.resource &&
      (taskEntry.resource as fhir.Task).status === 'draft') ||
    false
  )
}

export async function getRegistrationNumber(
  trackingId: string,
  practitionerId: string,
  authHeader: { Authorization: string }
): Promise<{ registrationNumber: string }> {
  try {
    const response = await fetch(
      `${RESOURCE_SERVICE_URL}generate/registrationNumber`,
      {
        method: 'POST',
        body: JSON.stringify({
          trackingId,
          practitionerId
        }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      }
    )
    return response.json()
  } catch (err) {
    throw new Error(`Unable to get registration number for error : ${err}`)
  }
}
