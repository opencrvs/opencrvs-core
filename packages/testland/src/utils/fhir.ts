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
// Copypasted types from @opencrvs/commons
// For this reason, here are shortcuts and `!` assertions, as we haven't copypasted ALL types from @opencrvs/commons

declare const __nominal__type: unique symbol
type Nominal<Type, Identifier extends string> = Type & {
  readonly [__nominal__type]: Identifier
}

type FhirResourceType =
  | fhir.Resource['resourceType']
  | 'TaskHistory'
  | 'CompositionHistory'

type UUID = Nominal<string, 'UUID'>

// Patient/${UUID}
type ResourceIdentifier<
  Resource extends { resourceType: FhirResourceType } = {
    resourceType: FhirResourceType
  }
> = `${Resource['resourceType']}/${UUID}`

export type TrackingID = Nominal<string, 'TrackingID'>
export type RegistrationNumber = Nominal<string, 'RegistrationNumber'>

export type TaskStatus =
  | 'IN_PROGRESS'
  | 'ARCHIVED'
  | 'DECLARED'
  | 'DECLARATION_UPDATED'
  | 'WAITING_VALIDATION'
  | 'CORRECTION_REQUESTED'
  | 'VALIDATED'
  | 'REGISTERED'
  | 'CERTIFIED'
  | 'REJECTED'
  | 'ISSUED'
export type Resource = fhir.Resource
export type Task = Omit<
  fhir.Task,
  | 'lastModified'
  | 'status'
  | 'extension'
  | 'businessStatus'
  | 'intent'
  | 'identifier'
  | 'code'
> & {
  lastModified: string
  status: 'ready' | 'requested' | 'draft' | 'accepted' | 'rejected'
  // Keeping this any, as it may be not be required to be typed for now
  extension: Array<any>
  businessStatus: Omit<fhir.CodeableConcept, 'coding'> & {
    coding: Array<
      Omit<fhir.Coding, 'code' | 'system'> & {
        system: 'http://opencrvs.org/specs/reg-status'
        code: TaskStatus
      }
    >
  }
  intent?: fhir.Task['intent']
  // Keeping this any, as it may be not be required to be typed for now
  identifier: Array<any>
  code: Omit<fhir.CodeableConcept, 'coding'> & {
    coding: Array<
      Omit<fhir.Coding, 'code' | 'system'> & {
        system: 'http://opencrvs.org/specs/types'
        code: 'BIRTH' | 'DEATH' | 'MARRIAGE'
      }
    >
  }
  // This field is missing from the fhir spec
  // @todo Where exactly it's used?
  encounter?: fhir.Reference
}

export type SavedTask = Omit<Task, 'focus' | 'id'> & {
  id: UUID
  focus: {
    reference: ResourceIdentifier
  }
}

export function isComposition<T extends Resource>(
  resource: T
): resource is T & fhir.Composition & { id: UUID } {
  return resource.resourceType === 'Composition'
}

export function getComposition<T extends fhir.Bundle>(bundle: T) {
  const composition = bundle
    .entry!.map(({ resource }) => resource!)
    .find(isComposition)

  if (!composition) {
    throw new Error('Composition not found in bundle')
  }

  return composition
}

const EVENTS = {
  BIRTH: 'BIRTH' as const,
  DEATH: 'DEATH' as const,
  MARRIAGE: 'MARRIAGE' as const
}
type ValueOf<T> = T[keyof T]
type EVENT_TYPE = ValueOf<typeof EVENTS>

const FHIR_TO_OPENCRVS_EVENT_MAP = {
  'birth-notification': EVENTS.BIRTH,
  'birth-declaration': EVENTS.BIRTH,
  'death-notification': EVENTS.DEATH,
  'death-declaration': EVENTS.DEATH,
  'marriage-notification': EVENTS.MARRIAGE,
  'marriage-declaration': EVENTS.MARRIAGE
}

function getCompositionEventType(composition: fhir.Composition) {
  const eventType = composition?.type?.coding?.[0]
    .code as keyof typeof FHIR_TO_OPENCRVS_EVENT_MAP
  return eventType && (FHIR_TO_OPENCRVS_EVENT_MAP[eventType] as EVENT_TYPE)
}

export function getEventType(fhirBundle: fhir.Bundle) {
  const composition = fhirBundle.entry?.find(
    (item) => item.resource?.resourceType === 'Composition'
  )?.resource as fhir.Composition
  if (composition) {
    return getCompositionEventType(composition as fhir.Composition)
  }
  throw new Error('Composition not found in FHIR bundle')
}

export function resourceIdentifierToUUID(
  resourceIdentifier: ResourceIdentifier
) {
  const urlParts = resourceIdentifier.split('/')
  return urlParts[urlParts.length - 1] as UUID
}

export type URNReference = `urn:uuid:${UUID}`

export function isURNReference(id: string): id is URNReference {
  return id.startsWith('urn:uuid:')
}

export function isSaved<T extends Resource>(resource: T) {
  return resource.id !== undefined
}

export function findEntryFromBundle(
  bundle: fhir.Bundle,
  reference: fhir.Reference['reference']
) {
  return isURNReference(reference!)
    ? bundle.entry!.find((entry) => entry.fullUrl === reference)
    : bundle.entry!.find(
        (entry) =>
          isSaved(entry.resource!) &&
          entry.resource!.id ===
            resourceIdentifierToUUID(reference as ResourceIdentifier)
      )
}

function getFromBundleById(bundle: fhir.Bundle, id: string) {
  const resource = bundle.entry?.find((item) => item.resource?.id === id)

  if (!resource) {
    throw new Error('Resource not found in bundle with id ' + id)
  }

  if (!resource.fullUrl) {
    throw new Error(
      'A resource was found but it did not have a fullUrl. This should not happen.'
    )
  }

  return resource
}

function findCompositionSection<T extends fhir.Composition>(
  code: string,
  composition: T
) {
  return composition.section!.find((section) =>
    section.code!.coding!.some((coding) => coding.code === code)
  )
}

export function findEntry(
  code: string,
  composition: fhir.Composition,
  bundle: fhir.Bundle
) {
  const patientSection = findCompositionSection(code, composition)
  if (!patientSection || !patientSection.entry) {
    return undefined
  }
  const reference = patientSection.entry[0].reference
  return getFromBundleById(bundle, reference!.split('/')[1]).resource
}

export function getChild(record: fhir.Bundle) {
  const composition = getComposition(record)
  return findEntry('child-details', composition, record) as fhir.Patient
}

export function findQuestionnaireResponse(record: fhir.Bundle, item: string) {
  const questionnaireResponses = record.entry?.find(
    ({ resource }) => resource?.resourceType === 'QuestionnaireResponse'
  )?.resource as fhir.QuestionnaireResponse | undefined

  return questionnaireResponses?.item?.find(({ text }) => text === item)
    ?.answer?.[0].valueString
}

export const getQuestionnaireResponseAnswer = (
  bundle: fhir.Bundle,
  question: string
) => {
  const resourceType = bundle.entry?.find(
    (entry) => entry.resource?.resourceType === 'QuestionnaireResponse'
  )
  const questionnaireResponse: any = resourceType?.resource

  const answer = questionnaireResponse?.item?.find(
    (item: any) => item.text === question
  )

  if (answer) {
    // for the current answer fields, type --> valueString
    // for number fields type can be different
    return answer.answer[0].valueString
  } else {
    return ''
  }
}

export function getChildFullName(bundle: fhir.Bundle) {
  const child = getChild(bundle)
  return child.name?.[0]?.given?.join(' ') + ' ' + child.name?.[0]?.family
}

export function getChildBirthDate(bundle: fhir.Bundle) {
  const child = getChild(bundle)
  return child.birthDate
}

export function getChildGender(bundle: fhir.Bundle) {
  const child = getChild(bundle)
  return child.gender
}

export function getGuardian(bundle: fhir.Bundle) {
  const composition = getComposition(bundle)
  const mother = findEntry(
    'mother-details',
    composition,
    bundle
  ) as fhir.Patient

  const father = findEntry(
    'father-details',
    composition,
    bundle
  ) as fhir.Patient
  return mother ?? father
}

export function getGuardianFullName(bundle: fhir.Bundle) {
  const guardian = getGuardian(bundle)
  return guardian.name?.[0]?.given?.join(' ') + ' ' + guardian.name?.[0]?.family
}

export function getReturnParentID(bundle: fhir.Bundle) {
  const composition = getComposition(bundle)
  const mother = findEntry(
    'mother-details',
    composition,
    bundle
  ) as fhir.Patient

  const father = findEntry(
    'father-details',
    composition,
    bundle
  ) as fhir.Patient
  const motherID = mother.identifier?.[0].value
  const fatherID = father.identifier?.[0].value

  if (motherID) {
    return {
      identifier: motherID,
      type: mother.identifier?.[0].type?.coding?.[0].code
    }
  } else if (fatherID) {
    return {
      identifier: fatherID,
      type: father.identifier?.[0].type?.coding?.[0].code
    }
  } else {
    return {
      identifier: '',
      type: 'NOT_FOUND'
    }
  }
}

export function getDeceased(record: fhir.Bundle) {
  const composition = getComposition(record)
  return findEntry('deceased-details', composition, record) as fhir.Patient
}

export function getPatientNationalId(patient: fhir.Patient) {
  const identifier = patient.identifier?.find(
    (identifier) => identifier.type?.coding?.[0].code === 'NATIONAL_ID'
  )
  if (!identifier?.value) {
    throw new Error('National ID not found in patient')
  }
  return identifier.value
}

export function getInformantPatient(record: fhir.Bundle) {
  const compositionSection = findCompositionSection(
    'informant-details',
    getComposition(record)
  )
  if (!compositionSection) return undefined
  const personSectionEntry = compositionSection.entry![0]
  const relatedPersonEntry = findEntryFromBundle(
    record,
    personSectionEntry.reference
  )
  const reference = (relatedPersonEntry?.resource as fhir.RelatedPerson).patient
    .reference
  return getFromBundleById(record, reference!.split('/')[1])
    .resource as fhir.Patient
}

export function getInformantFullName(bundle: fhir.Bundle) {
  const informant = getInformantPatient(bundle)
  return (
    informant?.name?.[0]?.given?.join(' ') + ' ' + informant?.name?.[0]?.family
  )
}

export function getEmailFromTaskResource(
  taskResource: fhir.Task
): string | undefined {
  const emailIdentifier = taskResource?.extension?.find(
    (ext) =>
      ext.url === 'http://opencrvs.org/specs/extension/contact-person-email'
  )
  return emailIdentifier?.valueString
}
export function getPhoneNumberFromTaskResource(
  taskResource: fhir.Task
): string | undefined {
  const phoneIdentifier = taskResource?.extension?.find(
    (ext) =>
      ext.url ===
      'http://opencrvs.org/specs/extension/contact-person-phone-number'
  )
  return phoneIdentifier?.valueString
}

export function getInformantRelation(record: fhir.Bundle) {
  const compositionSection = findCompositionSection(
    'informant-details',
    getComposition(record)
  )
  if (!compositionSection) return undefined
  const personSectionEntry = compositionSection.entry![0]
  const relatedPerson = findEntryFromBundle(
    record,
    personSectionEntry.reference
  )?.resource as fhir.RelatedPerson

  return relatedPerson?.relationship?.coding?.[0]?.code
}
