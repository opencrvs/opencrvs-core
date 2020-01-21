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

import fetch from 'node-fetch'
export const CHILD_CODE = 'child-details'
export const DECEASED_CODE = 'deceased-details'
import { FHIR_URL } from '@resources/constants'

export const OPENCRVS_SPECIFICATION_URL = 'http://opencrvs.org/specs/'
export enum EVENT_TYPE {
  BIRTH = 'BIRTH',
  DEATH = 'DEATH'
}

export interface ILocation {
  id?: string
  name?: string
  alias?: string
  physicalType?: string
  jurisdictionType?: string
  type?: string
  partOf?: string
}

export function getTaskResource(
  bundle: fhir.Bundle & fhir.BundleEntry
): fhir.Task | undefined {
  if (
    !bundle ||
    bundle.type !== 'document' ||
    !bundle.entry ||
    !bundle.entry[0] ||
    !bundle.entry[0].resource
  ) {
    throw new Error('Invalid FHIR bundle found')
  }

  if (bundle.entry[0].resource.resourceType === 'Composition') {
    return getTaskResourceFromFhirBundle(bundle as fhir.Bundle)
  } else if (bundle.entry[0].resource.resourceType === 'Task') {
    return bundle.entry[0].resource as fhir.Task
  } else {
    throw new Error('Unable to find Task Bundle from the provided data')
  }
}

export function getTaskResourceFromFhirBundle(fhirBundle: fhir.Bundle) {
  const taskEntry =
    fhirBundle.entry &&
    fhirBundle.entry.find((entry: fhir.BundleEntry) => {
      if (entry.resource && entry.resource.resourceType === 'Task') {
        return true
      }
      return false
    })

  return taskEntry && (taskEntry.resource as fhir.Task)
}

export function findExtension(
  url: string,
  extensions: fhir.Extension[]
): fhir.Extension | undefined {
  const extension = extensions.find((obj: fhir.Extension) => {
    return obj.url === url
  })
  return extension
}

export function getTrackingIdFromTaskResource(taskResource: fhir.Task) {
  const trackingIdentifier =
    taskResource &&
    taskResource.identifier &&
    taskResource.identifier.find(identifier => {
      return (
        identifier.system ===
          `${OPENCRVS_SPECIFICATION_URL}id/birth-tracking-id` ||
        identifier.system ===
          `${OPENCRVS_SPECIFICATION_URL}id/death-tracking-id`
      )
    })
  if (!trackingIdentifier || !trackingIdentifier.value) {
    throw new Error("Didn't find any identifier for tracking id")
  }
  return trackingIdentifier.value
}

export function getEventDateFromBundle(bundle: fhir.Bundle): string {
  const personInfo =
    getEventType(bundle) === EVENT_TYPE.DEATH
      ? {
          sectionCode: DECEASED_CODE,
          eventDateFieldKey: 'deceasedDateTime'
        }
      : {
          sectionCode: CHILD_CODE,
          eventDateFieldKey: 'birthDate'
        }
  const patient = findPersonEntryFromBundle(personInfo.sectionCode, bundle)
  if (!patient || !patient[personInfo.eventDateFieldKey]) {
    throw new Error('Unable to find event date from given bundle')
  }
  return patient[personInfo.eventDateFieldKey] as string
}

export function getEventType(bundle: fhir.Bundle) {
  if (
    !bundle ||
    bundle.type !== 'document' ||
    !bundle.entry ||
    !bundle.entry[0] ||
    !bundle.entry[0].resource ||
    bundle.entry[0].resource.resourceType !== 'Composition'
  ) {
    throw new Error('Invalid FHIR bundle found')
  }
  const composition = bundle.entry[0].resource as fhir.Composition

  const eventType =
    composition &&
    composition.type &&
    composition.type.coding &&
    composition.type.coding[0].code

  if (eventType === 'death-application' || eventType === 'death-notification') {
    return EVENT_TYPE.DEATH
  } else {
    return EVENT_TYPE.BIRTH
  }
}

export function findPersonEntryFromBundle(
  sectionCode: string,
  bundle: fhir.Bundle
): fhir.Patient {
  const composition =
    bundle && bundle.entry && (bundle.entry[0].resource as fhir.Composition)

  const personSectionEntry = getSectionEntryBySectionCode(
    composition,
    sectionCode
  )
  const personEntry =
    bundle.entry &&
    bundle.entry.find(entry => entry.fullUrl === personSectionEntry.reference)

  if (!personEntry) {
    throw new Error(
      'Patient referenced from composition section not found in FHIR bundle'
    )
  }
  return personEntry.resource as fhir.Patient
}

export function getSectionEntryBySectionCode(
  composition: fhir.Composition | undefined,
  sectionCode: string
): fhir.Reference {
  const personSection =
    composition &&
    composition.section &&
    composition.section.find((section: fhir.CompositionSection) => {
      if (!section.code || !section.code.coding) {
        return false
      }
      return section.code.coding.some(coding => coding.code === sectionCode)
    })

  if (!personSection || !personSection.entry) {
    throw new Error(
      `Invalid person section found for given code: ${sectionCode}`
    )
  }
  return personSection.entry[0]
}

export const getFromFhir = (suffix: string) => {
  return fetch(`${FHIR_URL}${suffix.startsWith('/') ? '' : '/'}${suffix}`, {
    headers: {
      'Content-Type': 'application/json+fhir'
    }
  })
    .then(response => {
      return response.json()
    })
    .catch(error => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
    })
}
