/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as ShortUIDGen from 'short-uid'
import { NOTIFICATION_SERVICE_URL } from '@workflow/constants'
import fetch from 'node-fetch'
import { logger } from '@workflow/logger'
import {
  getInformantName,
  getTrackingId,
  getCRVSOfficeName,
  getBirthRegistrationNumber,
  getDeathRegistrationNumber
} from '@workflow/features/registration/fhir/fhir-utils'
import {
  EVENT_TYPE,
  CHILD_SECTION_CODE,
  DECEASED_SECTION_CODE,
  BIRTH_CORRECTION_ENCOUNTERS_SECTION_CODE,
  DEATH_CORRECTION_ENCOUNTERS_SECTION_CODE
} from '@workflow/features/registration/fhir/constants'
import { Events } from '@workflow/features/events/handler'
import { getTaskResource } from '@workflow/features/registration/fhir/fhir-template'
import { getTaskEventType } from '@workflow/features/task/fhir/utils'

interface INotificationPayload {
  msisdn: string
  name?: string
  trackingId?: string
  crvsOffice?: string
  registrationNumber?: string
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
    .map((char) => char.charCodeAt(0).toString())
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
    case Events.BIRTH_IN_PROGRESS_DEC:
      await sendNotification('birthInProgressSMS', msisdn, authHeader, {
        trackingId: getTrackingId(fhirBundle),
        crvsOffice: await getCRVSOfficeName(fhirBundle)
      })
      break
    case Events.BIRTH_NEW_DEC:
    case Events.BIRTH_REQUEST_FOR_REGISTRAR_VALIDATION:
      await sendNotification('birthDeclarationSMS', msisdn, authHeader, {
        name: await getInformantName(fhirBundle, CHILD_SECTION_CODE),
        trackingId: getTrackingId(fhirBundle)
      })
      break
    case Events.BIRTH_MARK_REG:
      await sendNotification('birthRegistrationSMS', msisdn, authHeader, {
        name: await getInformantName(fhirBundle, CHILD_SECTION_CODE),
        trackingId: getTrackingId(fhirBundle),
        registrationNumber: getBirthRegistrationNumber(
          getTaskResource(fhirBundle)
        )
      })
      break
    case Events.BIRTH_MARK_VOID:
      await sendNotification('birthRejectionSMS', msisdn, authHeader, {
        name: await getInformantName(fhirBundle, CHILD_SECTION_CODE),
        trackingId: getTrackingId(fhirBundle)
      })
      break
    case Events.DEATH_IN_PROGRESS_DEC:
      await sendNotification('deathInProgressSMS', msisdn, authHeader, {
        trackingId: getTrackingId(fhirBundle),
        crvsOffice: await getCRVSOfficeName(fhirBundle)
      })
      break
    case Events.DEATH_NEW_DEC:
    case Events.DEATH_REQUEST_FOR_REGISTRAR_VALIDATION:
      await sendNotification('deathDeclarationSMS', msisdn, authHeader, {
        name: await getInformantName(fhirBundle, DECEASED_SECTION_CODE),
        trackingId: getTrackingId(fhirBundle)
      })
      break
    case Events.DEATH_MARK_REG:
      await sendNotification('deathRegistrationSMS', msisdn, authHeader, {
        name: await getInformantName(fhirBundle, DECEASED_SECTION_CODE),
        trackingId: getTrackingId(fhirBundle),
        registrationNumber: getDeathRegistrationNumber(
          getTaskResource(fhirBundle)
        )
      })
      break
    case Events.DEATH_MARK_VOID:
      await sendNotification('deathRejectionSMS', msisdn, authHeader, {
        name: await getInformantName(fhirBundle, DECEASED_SECTION_CODE),
        trackingId: getTrackingId(fhirBundle)
      })
  }
}

export async function sendRegisteredNotification(
  msisdn: string,
  informantName: string,
  trackingId: string,
  registrationNumber: string,
  eventType: EVENT_TYPE,
  authHeader: { Authorization: string }
) {
  if (eventType === EVENT_TYPE.BIRTH) {
    await sendNotification('birthRegistrationSMS', msisdn, authHeader, {
      name: informantName,
      trackingId,
      registrationNumber
    })
  } else {
    await sendNotification('deathRegistrationSMS', msisdn, authHeader, {
      name: informantName,
      trackingId,
      registrationNumber
    })
  }
}

async function sendNotification(
  smsType: string,
  msisdn: string,
  authHeader: { Authorization: string },
  notificationPayload: {
    name?: string
    trackingId?: string
    crvsOffice?: string
    registrationNumber?: string
  }
) {
  const payload: INotificationPayload = {
    msisdn,
    ...notificationPayload
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

  if (eventType === 'death-declaration' || eventType === 'death-notification') {
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

export function taskHasInput(taskResource: fhir.Task) {
  return !!(taskResource.input && taskResource.input.length > 0)
}

export function hasCorrectionEncounterSection(
  compositionResource: fhir.Composition
) {
  return compositionResource.section?.some((section) => {
    if (section.code?.coding?.[0]?.code) {
      return [
        BIRTH_CORRECTION_ENCOUNTERS_SECTION_CODE,
        DEATH_CORRECTION_ENCOUNTERS_SECTION_CODE
      ].includes(section.code.coding[0].code)
    }
    return false
  })
}

export function isInProgressDeclaration(fhirBundle: fhir.Bundle) {
  const taskEntry =
    fhirBundle &&
    fhirBundle.entry &&
    fhirBundle.entry.find(
      (entry) => entry.resource && entry.resource.resourceType === 'Task'
    )

  return (
    (taskEntry &&
      taskEntry.resource &&
      (taskEntry.resource as fhir.Task).status === 'draft') ||
    false
  )
}

export function isEventNotification(fhirBundle: fhir.Bundle) {
  const compositionEntry =
    fhirBundle &&
    fhirBundle.entry &&
    fhirBundle.entry.find(
      (entry) => entry.resource && entry.resource.resourceType === 'Composition'
    )
  const composition =
    compositionEntry && (compositionEntry.resource as fhir.Composition)
  const compositionDocTypeCode =
    composition &&
    composition.type.coding &&
    composition.type.coding.find(
      (coding) => coding.system === 'http://opencrvs.org/doc-types'
    )
  return (
    (compositionDocTypeCode &&
      compositionDocTypeCode.code &&
      compositionDocTypeCode.code.endsWith('-notification')) ||
    false
  )
}

export function isEventNonNotifiable(event: Events) {
  return (
    [
      Events.BIRTH_WAITING_EXTERNAL_RESOURCE_VALIDATION,
      Events.DEATH_WAITING_EXTERNAL_RESOURCE_VALIDATION,
      Events.REGISTRAR_BIRTH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION,
      Events.REGISTRAR_DEATH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION
    ].indexOf(event) >= 0
  )
}
