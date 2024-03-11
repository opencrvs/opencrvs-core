/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import {
  COUNTRY_CONFIG_URL,
  FHIR_URL,
  MOSIP_TOKEN_SEEDER_URL
} from '@workflow/constants'
import { EVENT_TYPE } from '@workflow/features/registration/fhir/constants'
import { concatenateName } from '@workflow/features/registration/fhir/fhir-utils'
import { logger } from '@workflow/logger'
import fetch from 'node-fetch'
import * as ShortUIDGen from 'short-uid'
import {
  Bundle,
  BundleEntry,
  Composition,
  DocumentReference,
  Patient,
  Resource,
  Saved,
  Task,
  TrackingID
} from '@opencrvs/commons/types'
import { MAKE_CORRECTION_EXTENSION_URL } from '@workflow/features/task/fhir/constants'
import { getTaskEventType } from '@workflow/features/task/fhir/utils'

export enum FHIR_RESOURCE_TYPE {
  COMPOSITION = 'Composition',
  TASK = 'Task',
  ENCOUNTER = 'Encounter',
  PAYMENT_RECONCILIATION = 'PaymentReconciliation',
  PATIENT = 'Patient'
}

export async function generateTrackingIdForEvents(
  eventType: EVENT_TYPE,
  bundle: Bundle,
  token: string
) {
  const trackingIdFromCountryConfig = await getTrackingIdFromCountryConfig(
    bundle,
    token
  )
  if (trackingIdFromCountryConfig) {
    return trackingIdFromCountryConfig as TrackingID
  } else {
    // using first letter of eventType for prefix
    // TODO: for divorce, need to think about prefix as Death & Divorce prefix is same 'D'
    return generateTrackingId(eventType.charAt(0)) as TrackingID
  }
}

export async function getTrackingIdFromCountryConfig(
  bundle: Bundle,
  token: string
): Promise<string | null> {
  return fetch(new URL('/tracking-id', COUNTRY_CONFIG_URL).toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-type': 'application/json'
    },
    body: JSON.stringify(bundle)
  }).then((res) => {
    if (res.ok) return res.text()
    else if (res.status === 404) return null
    else throw new Error(res.statusText)
  })
}

function generateTrackingId(prefix: string): string {
  return prefix.concat(new ShortUIDGen().randomUUID()).toUpperCase()
}

export function convertStringToASCII(str: string): string {
  return [...str]
    .map((char) => char.charCodeAt(0).toString())
    .reduce((acc, v) => acc.concat(v))
}

const DETECT_EVENT: Record<string, EVENT_TYPE> = {
  'birth-notification': EVENT_TYPE.BIRTH,
  'birth-declaration': EVENT_TYPE.BIRTH,
  'death-notification': EVENT_TYPE.DEATH,
  'death-declaration': EVENT_TYPE.DEATH,
  'marriage-notification': EVENT_TYPE.MARRIAGE,
  'marriage-declaration': EVENT_TYPE.MARRIAGE
}

export function getCompositionEventType(compoition: Composition) {
  const eventType = compoition?.type?.coding?.[0].code
  return eventType && DETECT_EVENT[eventType]
}

export function getEventType(fhirBundle: Bundle) {
  if (fhirBundle.entry && fhirBundle.entry[0] && fhirBundle.entry[0].resource) {
    const firstEntry = fhirBundle.entry[0].resource
    if (firstEntry.resourceType === 'Composition') {
      return getCompositionEventType(firstEntry as Composition) as EVENT_TYPE
    } else {
      return getTaskEventType(firstEntry as Task) as EVENT_TYPE
    }
  }
  throw new Error('Invalid FHIR bundle found')
}

export function taskHasInput(taskResource: Task) {
  return !!(taskResource.input && taskResource.input.length > 0)
}

export function hasCorrectionExtension(taskResource: Task) {
  return taskResource.extension.some(
    (extension) => extension.url === MAKE_CORRECTION_EXTENSION_URL
  )
}

export function hasCertificateDataInDocRef(fhirBundle: Bundle) {
  const firstEntry = fhirBundle?.entry?.[0].resource as Composition

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
      (item.resource as DocumentReference)?.content?.length > 0
    ) {
      return true
    }
    return false
  })
}

export function isInProgressDeclaration(fhirBundle: Bundle) {
  const taskEntry =
    fhirBundle &&
    fhirBundle.entry &&
    fhirBundle.entry.find(
      (entry): entry is BundleEntry<Task> =>
        entry.resource && entry.resource.resourceType === 'Task'
    )

  return (
    (taskEntry &&
      taskEntry.resource &&
      taskEntry.resource.status === 'draft') ||
    false
  )
}

export function isHospitalNotification(fhirBundle: Bundle) {
  const compositionEntry =
    fhirBundle &&
    fhirBundle.entry &&
    fhirBundle.entry.find(
      (entry) => entry.resource && entry.resource.resourceType === 'Composition'
    )
  const composition =
    compositionEntry && (compositionEntry.resource as Composition)
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
  patient: Patient
): Promise<IMosipSeederResponse> {
  logger.info(`getMosipUINToken for Patient id ${patient.id}`)
  let submittedNationalIDInForm = ''
  const identifiers = patient?.identifier?.filter(
    (identifier: fhir3.Identifier) => {
      return identifier.type?.coding?.[0].code === 'NATIONAL_ID'
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
        name: concatenateName(patient.name),
        gender: patient.gender,
        dob: patient.birthDate?.replace(/-/g, '/')
        // TODO: send informant contact phone number?  We dont ask for deceased's phone number in Civil Reg form currently
        // TODO: send address in a way MOSIP can understand
      }
    }
  }
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

export function getResourceByType<T = Resource>(
  bundle: Bundle,
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

export function getComposition<T extends Bundle>(bundle: T) {
  return getResourceByType<
    T extends Saved<Bundle> ? Saved<Composition> : Composition
  >(bundle, FHIR_RESOURCE_TYPE.COMPOSITION)
}

export function getPatientBySection(bundle: Bundle, section: fhir3.Reference) {
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
    })?.resource as fhir3.Patient)
  )
}
export const fetchHearth = async <T = any>(
  suffix: string,
  method = 'GET',
  body: string | undefined = undefined
): Promise<T> => {
  const res = await fetch(`${FHIR_URL}${suffix}`, {
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
  const taskBundle: Bundle = await fetchHearth(`/Task?focus=Composition/${id}`)
  return taskBundle.entry?.[0]?.resource as Task
}
