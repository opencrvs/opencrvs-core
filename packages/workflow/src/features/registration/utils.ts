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
  Bundle,
  BundleEntry,
  Composition,
  Resource,
  Saved,
  Task,
  TrackingID
} from '@opencrvs/commons/types'
import { COUNTRY_CONFIG_URL } from '@workflow/constants'
import { EVENT_TYPE } from '@workflow/features/registration/fhir/constants'
import { getTaskEventType } from '@workflow/features/task/fhir/utils'
import fetch from 'node-fetch'
import * as ShortUIDGen from 'short-uid'

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

async function getTrackingIdFromCountryConfig(
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

function getCompositionEventType(compoition: Composition) {
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

function getResourceByType<T = Resource>(
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

enum FHIR_RESOURCE_TYPE {
  COMPOSITION = 'Composition',
  TASK = 'Task',
  ENCOUNTER = 'Encounter',
  PAYMENT_RECONCILIATION = 'PaymentReconciliation',
  PATIENT = 'Patient'
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
