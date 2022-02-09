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
import { v4 as uuid } from 'uuid'
import {
  OPENCRVS_SPECIFICATION_URL,
  EVENT_TYPE
} from '@workflow/features/registration/fhir/constants'
import { getFromFhir } from '@workflow/features/registration/fhir/fhir-utils'
import { getEventType } from '@workflow/features/registration/utils'

export const INFORMANT_CODE = 'informant-details'

function isTask(resource: fhir.Resource | undefined): resource is fhir.Task {
  return resource?.resourceType === 'Task'
}

export function getTaskResource(bundle: fhir.Bundle & fhir.BundleEntry) {
  if (
    !bundle ||
    bundle.type !== 'document' ||
    !bundle.entry ||
    !bundle.entry[0].resource
  ) {
    throw new Error('Invalid FHIR bundle found')
  }

  if (bundle.entry[0].resource.resourceType === 'Composition') {
    return selectOrCreateTaskRefResource(bundle as fhir.Bundle)
  } else if (isTask(bundle.entry[0].resource)) {
    return bundle.entry[0].resource
  } else {
    throw new Error('Unable to find Task Bundle from the provided data')
  }
}

export function selectOrCreateTaskRefResource(fhirBundle: fhir.Bundle) {
  let taskResource = getTaskResourceFromFhirBundle(fhirBundle) as fhir.Task
  if (!taskResource) {
    const taskEntry = createTaskRefTemplate(getEventType(fhirBundle))
    if (!fhirBundle.entry) {
      fhirBundle.entry = []
    }
    taskResource = taskEntry.resource as fhir.Task
    if (!taskResource.focus) {
      taskResource.focus = { reference: '' }
    }
    taskResource.focus.reference = fhirBundle.entry[0].fullUrl
    fhirBundle.entry.push(taskEntry)
  }
  return taskResource
}

export function getTaskResourceFromFhirBundle(fhirBundle: fhir.Bundle) {
  const taskEntry =
    fhirBundle.entry &&
    fhirBundle.entry.find((entry) => {
      if (entry.resource && entry.resource.resourceType === 'Task') {
        return true
      }
      return false
    })
  return taskEntry && taskEntry.resource
}

function createTaskRefTemplate(event: EVENT_TYPE) {
  return {
    fullUrl: `urn:uuid:${uuid()}`,
    resource: {
      resourceType: 'Task',
      status: 'requested',
      code: {
        coding: [
          {
            system: `${OPENCRVS_SPECIFICATION_URL}types`,
            code: event.toString()
          }
        ]
      }
    }
  }
}
export async function findInformantEntry(
  fhirBundle: fhir.Bundle
): Promise<fhir.Patient | undefined> {
  const informantEntry = selectInformantResource(fhirBundle)
  if (informantEntry) {
    return informantEntry
  }
  const informantRelatedPersonEntry = (await findPersonEntry(
    INFORMANT_CODE,
    fhirBundle
  )) as fhir.RelatedPerson
  if (!informantRelatedPersonEntry) {
    return undefined
  }
  return await getFromFhir(`/${informantRelatedPersonEntry.patient.reference}`)
}

export async function findPersonEntry(
  sectionCode: string,
  fhirBundle: fhir.Bundle
): Promise<fhir.Patient | undefined> {
  const resource =
    fhirBundle && fhirBundle.entry && fhirBundle.entry[0].resource
  if (!resource) {
    throw new Error('No resource found')
  }
  switch (resource.resourceType) {
    case 'Composition':
      return findPersonEntryByComposition(sectionCode, fhirBundle)
    case 'Task':
      return findPersonEntryByTask(sectionCode, fhirBundle)
    default:
      return undefined
  }
}

export async function findPersonEntryByComposition(
  sectionCode: string,
  fhirBundle: fhir.Bundle
): Promise<fhir.Patient | undefined> {
  const composition =
    fhirBundle &&
    fhirBundle.entry &&
    (fhirBundle.entry[0].resource as fhir.Composition)

  const personSectionEntry = getSectionEntryBySectionCode(
    composition,
    sectionCode
  )
  const personEntry =
    fhirBundle.entry &&
    fhirBundle.entry.find(
      (entry) => entry.fullUrl === personSectionEntry.reference
    )

  if (!personEntry) {
    throw new Error(
      'Patient referenced from composition section not found in FHIR bundle'
    )
  }
  return personEntry.resource as fhir.Patient
}

export async function findPersonEntryByTask(
  sectionCode: string,
  fhirBundle: fhir.Bundle
): Promise<fhir.Patient | undefined> {
  const task =
    fhirBundle &&
    fhirBundle.entry &&
    (fhirBundle.entry[0].resource as fhir.Task)
  const compositionRef = task && task.focus && task.focus.reference
  if (!compositionRef) {
    throw new Error(`No composition reference found`)
  }
  const composition: fhir.Composition = await getFromFhir(`/${compositionRef}`)
  const personSectionEntry = getSectionEntryBySectionCode(
    composition,
    sectionCode
  )
  return await getFromFhir(`/${personSectionEntry.reference}`)
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
      return section.code.coding.some((coding) => coding.code === sectionCode)
    })

  if (!personSection || !personSection.entry) {
    throw new Error(
      `Invalid person section found for given code: ${sectionCode}`
    )
  }
  return personSection.entry[0]
}

export function selectInformantResource(
  fhirBundle: fhir.Bundle
): fhir.Patient | undefined {
  const composition =
    fhirBundle &&
    fhirBundle.entry &&
    (fhirBundle.entry[0].resource as fhir.Composition)

  const informantSection =
    composition &&
    composition.section &&
    composition.section.find((section: fhir.CompositionSection) => {
      if (!section.code || !section.code.coding || !section.code.coding.some) {
        return false
      }
      return section.code.coding.some(
        (coding) => coding.code === INFORMANT_CODE
      )
    })

  const informantSectionEntry =
    informantSection && informantSection.entry && informantSection.entry[0]

  const relatedPersonEntry =
    informantSectionEntry &&
    fhirBundle &&
    fhirBundle.entry &&
    fhirBundle.entry.find(
      (entry) => entry.fullUrl === informantSectionEntry.reference
    )

  const informantEntry =
    relatedPersonEntry &&
    fhirBundle &&
    fhirBundle.entry &&
    fhirBundle.entry.find(
      (entry) =>
        entry.fullUrl ===
        (relatedPersonEntry.resource as fhir.RelatedPerson).patient.reference
    )

  return informantEntry && (informantEntry.resource as fhir.Patient)
}
