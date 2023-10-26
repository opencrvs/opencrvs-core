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
  Composition,
  isTask,
  Patient,
  RelatedPerson,
  Task
} from '@opencrvs/commons/types'
import { getFromFhir } from '@workflow/features/registration/fhir/fhir-utils'
import { CompositionSection } from 'fhir/r3'

export const INFORMANT_CODE = 'informant-details'

export function getTaskResourceFromFhirBundle(fhirBundle: Bundle): Task {
  const resources = fhirBundle.entry.map((entry) => entry.resource)

  const task = resources.find(isTask)

  if (!task) {
    throw new Error('No task resource found')
  }

  return task
}

export async function findPersonEntry(
  sectionCode: string,
  fhirBundle: Bundle
): Promise<Patient | undefined> {
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
export async function findRelatedPersonEntry(
  sectionCode: string,
  fhirBundle: Bundle
): Promise<Patient | undefined> {
  const resource =
    fhirBundle && fhirBundle.entry && fhirBundle.entry[0].resource
  if (!resource) {
    throw new Error('No resource found')
  }
  switch (resource.resourceType) {
    case 'Composition':
      return findRelatedPersonEntryByComposition(sectionCode, fhirBundle)
    case 'Task':
      return findRelatedPersonEntryByTask(sectionCode, fhirBundle)
    default:
      return undefined
  }
}

export async function findPersonEntryByComposition(
  sectionCode: string,
  fhirBundle: Bundle
): Promise<Patient | undefined> {
  const composition =
    fhirBundle &&
    fhirBundle.entry &&
    (fhirBundle.entry[0].resource as Composition)

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
  return personEntry.resource as Patient
}

export async function findRelatedPersonEntryByComposition(
  sectionCode: string,
  fhirBundle: Bundle
): Promise<Patient | undefined> {
  const composition =
    fhirBundle &&
    fhirBundle.entry &&
    (fhirBundle.entry[0].resource as Composition)

  const personSectionEntry = getSectionEntryBySectionCode(
    composition,
    sectionCode
  )
  const relatedPersonEntry =
    fhirBundle.entry &&
    fhirBundle.entry.find(
      (entry) => entry.fullUrl === personSectionEntry.reference
    )

  if (!relatedPersonEntry) {
    throw new Error(
      'RelatedPersonEntry referenced from composition section not found in FHIR bundle'
    )
  }

  const personEntry =
    fhirBundle.entry &&
    fhirBundle.entry.find(
      (entry) =>
        entry.fullUrl ===
        (relatedPersonEntry.resource as RelatedPerson).patient.reference
    )

  if (!personEntry) {
    throw new Error(
      'PersonEntry referenced from composition section not found in FHIR bundle'
    )
  }

  return personEntry.resource as Patient
}

export async function findPersonEntryByTask(
  sectionCode: string,
  fhirBundle: Bundle
): Promise<Patient | undefined> {
  const task =
    fhirBundle && fhirBundle.entry && (fhirBundle.entry[0].resource as Task)
  const compositionRef = task && task.focus && task.focus.reference
  if (!compositionRef) {
    throw new Error(`No composition reference found`)
  }
  const composition: Composition = await getFromFhir(`/${compositionRef}`)
  const personSectionEntry = getSectionEntryBySectionCode(
    composition,
    sectionCode
  )
  return await getFromFhir(`/${personSectionEntry.reference}`)
}

export async function findRelatedPersonEntryByTask(
  sectionCode: string,
  fhirBundle: Bundle
): Promise<Patient | undefined> {
  const task =
    fhirBundle && fhirBundle.entry && (fhirBundle.entry[0].resource as Task)
  const compositionRef = task && task.focus && task.focus.reference
  if (!compositionRef) {
    throw new Error(`No composition reference found`)
  }
  const composition: Composition = await getFromFhir(`/${compositionRef}`)
  const relatedPersonSectionEntry = getSectionEntryBySectionCode(
    composition,
    sectionCode
  )
  const relatedPerson = (await getFromFhir(
    `/${relatedPersonSectionEntry.reference}`
  )) as RelatedPerson
  return (await getFromFhir(`/${relatedPerson.patient.reference}`)) as Patient
}

export function getSectionEntryBySectionCode(
  composition: Composition | undefined,
  sectionCode: string
): fhir3.Reference {
  const personSection =
    composition &&
    composition.section &&
    composition.section.find((section: CompositionSection) => {
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
  fhirBundle: Bundle
): Patient | undefined {
  const composition =
    fhirBundle &&
    fhirBundle.entry &&
    (fhirBundle.entry[0].resource as Composition)

  const informantSection =
    composition &&
    composition.section &&
    composition.section.find((section: CompositionSection) => {
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
        (relatedPersonEntry.resource as RelatedPerson).patient.reference
    )

  return informantEntry && (informantEntry.resource as Patient)
}
