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
import {
  NOTIFICATION_SERVICE_URL,
  MOSIP_TOKEN_SEEDER_URL,
  HEARTH_URL
} from '@workflow/constants'
import fetch from 'node-fetch'
import { logger } from '@workflow/logger'
import {
  getSubjectName,
  getTrackingId,
  getCRVSOfficeName,
  getRegistrationNumber,
  concatenateName,
  getInformantName
} from '@workflow/features/registration/fhir/fhir-utils'
import {
  EVENT_TYPE,
  CHILD_SECTION_CODE,
  DECEASED_SECTION_CODE,
  BIRTH_CORRECTION_ENCOUNTERS_SECTION_CODE,
  DEATH_CORRECTION_ENCOUNTERS_SECTION_CODE,
  MARRIAGE_CORRECTION_ENCOUNTERS_SECTION_CODE,
  INFORMANT_SECTION_CODE
} from '@workflow/features/registration/fhir/constants'
import { Events } from '@workflow/features/events/utils'
import { getTaskResource } from '@workflow/features/registration/fhir/fhir-template'
import { getTaskEventType } from '@workflow/features/task/fhir/utils'
import {
  getInformantSMSNotification,
  InformantNotificationName,
  isInformantSMSNotificationEnabled
} from './smsNotificationUtils'

interface INotificationPayload {
  recipient: {
    sms?: string | null
    email?: string | null
  }
  name?: string
  trackingId?: string
  crvsOffice?: string
  registrationNumber?: string
}
export type Composition = fhir.Composition & { id: string }
export type Patient = fhir.Patient & { id: string }
export enum FHIR_RESOURCE_TYPE {
  COMPOSITION = 'Composition',
  TASK = 'Task',
  ENCOUNTER = 'Encounter',
  PAYMENT_RECONCILIATION = 'PaymentReconciliation',
  PATIENT = 'Patient'
}

export function generateTrackingIdForEvents(eventType: EVENT_TYPE): string {
  // using first letter of eventType for prefix
  // TODO: for divorce, need to think about prefix as Death & Divorce prefix is same 'D'
  return generateTrackingId(eventType.charAt(0))
}

function generateTrackingId(prefix: string): string {
  return prefix.concat(new ShortUIDGen().randomUUID()).toUpperCase()
}

export function convertStringToASCII(str: string): string {
  return [...str]
    .map((char) => char.charCodeAt(0).toString())
    .reduce((acc, v) => acc.concat(v))
}

// TODO: refactor after getting appropiate sms message for marriage & divorce (also need to modify getSubjectName() )
export async function sendEventNotification(
  fhirBundle: fhir.Bundle,
  event: Events,
  recipient: {
    sms?: string | null
    email?: string | null
  },
  authHeader: { Authorization: string }
) {
  const informantSMSNotifications = await getInformantSMSNotification(
    authHeader.Authorization
  )

  const eventType = getEventType(fhirBundle)
  switch (event) {
    case Events.BIRTH_IN_PROGRESS_DEC:
      if (
        isInformantSMSNotificationEnabled(
          informantSMSNotifications,
          InformantNotificationName.birthInProgressSMS
        )
      ) {
        logger.info(`sendEventNotification method for event: ${event}`)
        await sendNotification(
          InformantNotificationName.birthInProgressSMS,
          recipient,
          authHeader,
          {
            trackingId: getTrackingId(fhirBundle),
            crvsOffice: await getCRVSOfficeName(fhirBundle)
          }
        )
      }
      break
    case Events.BIRTH_NEW_DEC:
    case Events.BIRTH_REQUEST_FOR_REGISTRAR_VALIDATION:
      if (
        isInformantSMSNotificationEnabled(
          informantSMSNotifications,
          InformantNotificationName.birthDeclarationSMS
        )
      ) {
        logger.info(`sendEventNotification method for event: ${event}`)
        await sendNotification(
          InformantNotificationName.birthDeclarationSMS,
          recipient,
          authHeader,
          {
            trackingId: getTrackingId(fhirBundle),
            crvsOffice: await getCRVSOfficeName(fhirBundle),
            name: await getSubjectName(fhirBundle, CHILD_SECTION_CODE),
            informantName: await getInformantName(
              fhirBundle,
              INFORMANT_SECTION_CODE
            )
          }
        )
      }
      break
    case Events.BIRTH_MARK_REG:
      if (
        isInformantSMSNotificationEnabled(
          informantSMSNotifications,
          InformantNotificationName.birthRegistrationSMS
        )
      ) {
        logger.info(`sendEventNotification method for event: ${event}`)
        await sendNotification(
          InformantNotificationName.birthRegistrationSMS,
          recipient,
          authHeader,
          {
            trackingId: getTrackingId(fhirBundle),
            crvsOffice: await getCRVSOfficeName(fhirBundle),
            name: await getSubjectName(fhirBundle, CHILD_SECTION_CODE),
            informantName: await getInformantName(
              fhirBundle,
              INFORMANT_SECTION_CODE
            ),
            registrationNumber: getRegistrationNumber(
              getTaskResource(fhirBundle),
              EVENT_TYPE[eventType]
            )
          }
        )
      }
      break
    case Events.BIRTH_MARK_VOID:
      if (
        isInformantSMSNotificationEnabled(
          informantSMSNotifications,
          InformantNotificationName.birthRejectionSMS
        )
      ) {
        logger.info(`sendEventNotification method for event: ${event}`)
        await sendNotification(
          InformantNotificationName.birthRejectionSMS,
          recipient,
          authHeader,
          {
            trackingId: getTrackingId(fhirBundle),
            crvsOffice: await getCRVSOfficeName(fhirBundle),
            name: await getSubjectName(fhirBundle, CHILD_SECTION_CODE),
            informantName: await getInformantName(
              fhirBundle,
              INFORMANT_SECTION_CODE
            )
          }
        )
      }
      break
    case Events.DEATH_IN_PROGRESS_DEC:
      if (
        isInformantSMSNotificationEnabled(
          informantSMSNotifications,
          InformantNotificationName.deathInProgressSMS
        )
      ) {
        logger.info(`sendEventNotification method for event: ${event}`)
        await sendNotification(
          InformantNotificationName.deathInProgressSMS,
          recipient,
          authHeader,
          {
            trackingId: getTrackingId(fhirBundle),
            crvsOffice: await getCRVSOfficeName(fhirBundle)
          }
        )
      }
      break
    case Events.DEATH_NEW_DEC:
    case Events.DEATH_REQUEST_FOR_REGISTRAR_VALIDATION:
      if (
        isInformantSMSNotificationEnabled(
          informantSMSNotifications,
          InformantNotificationName.deathDeclarationSMS
        )
      ) {
        logger.info(`sendEventNotification method for event: ${event}`)
        await sendNotification(
          InformantNotificationName.deathDeclarationSMS,
          recipient,
          authHeader,
          {
            trackingId: getTrackingId(fhirBundle),
            crvsOffice: await getCRVSOfficeName(fhirBundle),
            name: await getSubjectName(fhirBundle, DECEASED_SECTION_CODE),
            informantName: await getInformantName(
              fhirBundle,
              INFORMANT_SECTION_CODE
            )
          }
        )
      }
      break
    case Events.DEATH_MARK_REG:
      if (
        isInformantSMSNotificationEnabled(
          informantSMSNotifications,
          InformantNotificationName.deathRegistrationSMS
        )
      ) {
        logger.info(`sendEventNotification method for event: ${event}`)
        await sendNotification(
          InformantNotificationName.deathRegistrationSMS,
          recipient,
          authHeader,
          {
            trackingId: getTrackingId(fhirBundle),
            crvsOffice: await getCRVSOfficeName(fhirBundle),
            name: await getSubjectName(fhirBundle, DECEASED_SECTION_CODE),
            registrationNumber: getRegistrationNumber(
              getTaskResource(fhirBundle),
              EVENT_TYPE[eventType]
            ),
            informantName: await getInformantName(
              fhirBundle,
              INFORMANT_SECTION_CODE
            )
          }
        )
      }
      break
    case Events.DEATH_MARK_VOID:
      if (
        isInformantSMSNotificationEnabled(
          informantSMSNotifications,
          InformantNotificationName.deathRejectionSMS
        )
      ) {
        logger.info(`sendEventNotification method for event: ${event}`)
        await sendNotification(
          InformantNotificationName.deathRejectionSMS,
          recipient,
          authHeader,
          {
            trackingId: getTrackingId(fhirBundle),
            crvsOffice: await getCRVSOfficeName(fhirBundle),
            name: await getSubjectName(fhirBundle, DECEASED_SECTION_CODE),
            informantName: await getInformantName(
              fhirBundle,
              INFORMANT_SECTION_CODE
            )
          }
        )
      }
  }
}

export async function sendRegisteredNotification(
  recipient: {
    sms?: string | null
    email?: string | null
  },
  informantName: string,
  name: string,
  trackingId: string,
  registrationNumber: string,
  eventType: EVENT_TYPE,
  authHeader: { Authorization: string }
) {
  const informantSMSNotifications = await getInformantSMSNotification(
    authHeader.Authorization
  )
  if (
    eventType === EVENT_TYPE.BIRTH &&
    isInformantSMSNotificationEnabled(
      informantSMSNotifications,
      InformantNotificationName.birthRegistrationSMS
    )
  ) {
    await sendNotification('birthRegistrationSMS', recipient, authHeader, {
      informantName,
      name,
      trackingId,
      registrationNumber
    })
  } else if (
    eventType === EVENT_TYPE.DEATH &&
    isInformantSMSNotificationEnabled(
      informantSMSNotifications,
      InformantNotificationName.deathRegistrationSMS
    )
  ) {
    await sendNotification('deathRegistrationSMS', recipient, authHeader, {
      informantName,
      name,
      trackingId,
      registrationNumber
    })
  }
}

async function sendNotification(
  smsType: string,
  recipient: {
    sms?: string | null
    email?: string | null
  },
  authHeader: { Authorization: string },
  notificationPayload: {
    name?: string
    informantName?: string
    trackingId?: string
    crvsOffice?: string
    registrationNumber?: string
  }
) {
  const payload: INotificationPayload = {
    recipient,
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

const DETECT_EVENT: Record<string, EVENT_TYPE> = {
  'birth-notification': EVENT_TYPE.BIRTH,
  'birth-declaration': EVENT_TYPE.BIRTH,
  'death-notification': EVENT_TYPE.DEATH,
  'death-declaration': EVENT_TYPE.DEATH,
  'marriage-notification': EVENT_TYPE.MARRIAGE,
  'marriage-declaration': EVENT_TYPE.MARRIAGE
}

export function getCompositionEventType(compoition: fhir.Composition) {
  const eventType = compoition?.type?.coding?.[0].code
  return eventType && DETECT_EVENT[eventType]
}

export function getEventType(fhirBundle: fhir.Bundle) {
  if (fhirBundle.entry && fhirBundle.entry[0] && fhirBundle.entry[0].resource) {
    const firstEntry = fhirBundle.entry[0].resource
    if (firstEntry.resourceType === 'Composition') {
      return getCompositionEventType(
        firstEntry as fhir.Composition
      ) as EVENT_TYPE
    } else {
      return getTaskEventType(firstEntry as fhir.Task) as EVENT_TYPE
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
        DEATH_CORRECTION_ENCOUNTERS_SECTION_CODE,
        MARRIAGE_CORRECTION_ENCOUNTERS_SECTION_CODE
      ].includes(section.code.coding[0].code)
    }
    return false
  })
}

export function hasCertificateDataInDocRef(fhirBundle: fhir.Bundle) {
  const firstEntry = fhirBundle?.entry?.[0].resource as fhir.Composition

  const certificateSection = firstEntry.section?.find((sec) => {
    if (sec.code?.coding?.[0]?.code == 'certificates') {
      return true
    }
    return false
  })
  const docRefId = certificateSection?.entry?.[0].reference

  return fhirBundle.entry?.some((item) => {
    if (
      item.fullUrl === docRefId &&
      (item.resource as fhir.DocumentReference)?.content
    ) {
      return true
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
      Events.MARRIAGE_WAITING_EXTERNAL_RESOURCE_VALIDATION,
      Events.REGISTRAR_BIRTH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION,
      Events.REGISTRAR_DEATH_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION,
      Events.REGISTRAR_MARRIAGE_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION
    ].indexOf(event) >= 0
  )
}
interface IMosipAuthData {
  vid?: string
  name?: string
  gender?: string
  phoneNumber?: string
  dob?: string // Format "1998/01/01"
  emailId?: string
  fullAddress?: string
}

interface IMosipRequest {
  deliverytype?: 'sync'
  output?: string | ''
  lang: 'eng'
  authdata: IMosipAuthData
}

export interface IMosipSeederPayload {
  id: string | ''
  version: string | ''
  metadata: string | ''
  requesttime: string | ''
  request: IMosipRequest
}

export interface IMosipErrors {
  errorCode: string
  errorMessage: string
  actionMessage: string
}

export interface IMosipSeederResponseContent {
  authStatus: boolean
  authToken: string
}

export interface IMosipSeederResponse {
  id: 'mosip.identity.auth'
  version: 'v1'
  responseTime: string
  transactionID: string
  response: IMosipSeederResponseContent
  errors: IMosipErrors[]
}

export async function getMosipUINToken(
  patient: fhir.Patient
): Promise<IMosipSeederResponse> {
  logger.info(`getMosipUINToken: ${JSON.stringify(patient)}`)
  let submittedNationalIDInForm = ''
  const identifiers = patient?.identifier?.filter(
    (identifier: fhir.Identifier) => {
      return identifier.type === 'NATIONAL_ID'
    }
  )
  if (identifiers) {
    submittedNationalIDInForm = `${identifiers[0].value}`
  }
  const payload: IMosipSeederPayload = {
    id: '',
    version: '',
    metadata: '',
    requesttime: new Date().toISOString(),
    request: {
      lang: 'eng',
      authdata: {
        vid: submittedNationalIDInForm,
        name: concatenateName(patient.name as fhir.HumanName[]),
        gender: patient.gender,
        dob: patient.birthDate?.replace(/-/g, '/')
        // TODO: send informant contact phone number?  We dont ask for deceased's phone number in Civil Reg form currently
        // TODO: send address in a way MOSIP can understand
      }
    }
  }
  logger.info(`IMosipSeederPayload: ${JSON.stringify(payload)}`)
  const res = await fetch(`${MOSIP_TOKEN_SEEDER_URL}/authtoken/json`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!res.ok) {
    logger.info(
      `Unable to retrieve system mosip UIN token. Error: ${res.status} status received`
    )
  }

  const body = await res.json()

  return body
}

export function getResourceByType<T = fhir.Resource>(
  bundle: fhir.Bundle,
  type: string
): T | undefined {
  const bundleEntry =
    bundle &&
    bundle.entry &&
    bundle.entry.find((entry) => {
      if (!entry.resource) {
        return false
      } else {
        return entry.resource.resourceType === type
      }
    })
  return bundleEntry && (bundleEntry.resource as T)
}

export function getComposition(bundle: fhir.Bundle) {
  return getResourceByType<Composition>(bundle, FHIR_RESOURCE_TYPE.COMPOSITION)
}

export function getPatientBySection(
  bundle: fhir.Bundle,
  section: fhir.Reference
) {
  return (
    bundle &&
    bundle.entry &&
    (bundle.entry.find((entry) => {
      if (!entry.resource) {
        return false
      } else {
        return (
          entry.resource.resourceType === 'Patient' &&
          entry.fullUrl === section.reference
        )
      }
    })?.resource as fhir.Patient)
  )
}
export const fetchHearth = async <T = any>(
  suffix: string,
  method = 'GET',
  body: string | undefined = undefined
): Promise<T> => {
  const res = await fetch(`${HEARTH_URL}${suffix}`, {
    method: method,
    body,
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })

  if (!res.ok) {
    throw new Error(
      `FHIR get to /fhir failed with [${res.status}] body: ${await res.text()}`
    )
  }
  return res.json()
}

export async function fetchTaskByCompositionIdFromHearth(id: string) {
  const taskBundle: fhir.Bundle = await fetchHearth(
    `/Task?focus=Composition/${id}`
  )
  return taskBundle.entry?.[0]?.resource as fhir.Task
}

export function getVoidEvent(event: EVENT_TYPE): Events {
  switch (event) {
    case EVENT_TYPE.MARRIAGE:
      return Events.MARRIAGE_MARK_VOID
    case EVENT_TYPE.BIRTH:
      return Events.BIRTH_MARK_VOID
    case EVENT_TYPE.DEATH:
      return Events.DEATH_MARK_VOID
    default:
      return Events.BIRTH_MARK_VOID
  }
}
