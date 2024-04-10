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

import { RegistrationStatus, ValidRecord } from '../record'
import { Nominal } from '../nominal'
import { UUID } from '../uuid'
import { Encounter, SavedEncounter } from './encounter'
import { Extension, KnownExtensionType } from './extension'
import { Patient } from './patient'
import {
  CompositionSection,
  CompositionSectionCode,
  SavedCompositionSection
} from './composition'
import { SavedTask, Task, TaskHistory } from './task'
import { Practitioner, SavedPractitioner } from './practitioner'

export * from './practitioner'
export * from './task'
export * from './extension'
export * from './payments'
export * from './observation'
export * from './encounter'
export * from './patient'
export * from './composition'
export * from './constants'

export type Resource = fhir3.Resource

// urn:uuid:3bd79ffd-5bd7-489f-b0d2-3c6133d36e1e
export type URNReference = `urn:uuid:${UUID}`

// Patient/${UUID}
export type ResourceIdentifier<
  Resource extends { resourceType: FhirResourceType } = {
    resourceType: FhirResourceType
  }
> = `${Resource['resourceType']}/${UUID}`

// /fhir/Patient/3bd79ffd-5bd7-489f-b0d2-3c6133d36e1e/_history/94d9feab-78f9-4de7-9b4b-a4bcbef04a57
export type URLReference = Nominal<string, 'URLReference'>

export type Reference = Omit<fhir3.Reference, 'reference'> & {
  reference: URNReference | ResourceIdentifier
}

export type SavedReference = Omit<Reference, 'reference'> & {
  reference: ResourceIdentifier
}

export function isURLReference(id: string): id is URLReference {
  return id.startsWith('/fhir')
}

export function isURNReference(id: string): id is URNReference {
  return id.startsWith('urn:uuid:')
}

export function urlReferenceToUUID(reference: URLReference) {
  const urlParts = reference.split('/')
  return urlParts[urlParts.length - 3] as UUID
}

export function urlReferenceToResourceIdentifier(reference: URLReference) {
  const urlParts = reference.split('/')
  return urlParts.slice(2, 4).join('/') as ResourceIdentifier
}

export function resourceIdentifierToUUID(
  resourceIdentifier: ResourceIdentifier
) {
  const urlParts = resourceIdentifier.split('/')
  return urlParts[urlParts.length - 1] as UUID
}

export type WithStrictExtensions<T extends Resource> = Omit<T, 'extension'> & {
  extension?: Array<Extension>
}

export type Bundle<T extends Resource = Resource> = Omit<
  fhir3.Bundle,
  'entry'
> & {
  entry: Array<BundleEntry<T> | Saved<BundleEntry<T>>>
}

export type WithUUID<T extends Resource> = Omit<T, 'id'> & {
  id: UUID
}

type SavedResource<T extends Resource> = T extends Encounter
  ? SavedEncounter
  : T extends RelatedPerson
  ? SavedRelatedPerson
  : T extends Composition
  ? SavedComposition
  : T extends SavedCompositionHistory
  ? SavedCompositionHistory
  : T extends Reference
  ? SavedReference
  : T extends Location
  ? SavedLocation
  : T extends Task
  ? SavedTask
  : T extends Practitioner
  ? SavedPractitioner
  : T extends QuestionnaireResponse
  ? SavedQuestionnaireResponse
  : WithUUID<T>

export type SavedBundle<T extends Resource = Resource> = Omit<
  fhir3.Bundle,
  'entry'
> & {
  entry: Array<Saved<BundleEntry<T>>>
}

export type Saved<T extends Resource | BundleEntry | Bundle> =
  T extends BundleEntry<infer R>
    ? SavedBundleEntry<R>
    : T extends Bundle<infer R>
    ? SavedBundle<R>
    : T extends Resource
    ? SavedResource<T>
    : never

export type BundleEntry<T extends Resource = Resource> = Omit<
  fhir3.BundleEntry<T>,
  'resource' | 'fullUrl'
> & {
  resource: T
  fullUrl?: URNReference | URLReference
}

export type BundleEntryWithFullUrl<T extends Resource = Resource> = Omit<
  BundleEntry<T>,
  'fullUrl'
> & {
  fullUrl: URNReference | URLReference
}

/*
 * A placeholder until someone writes better with Zod
 */
export function validateBundle(bundle: unknown): bundle is Bundle {
  if (typeof bundle !== 'object' || bundle === null) {
    throw new Error('Bundle must be an object')
  }
  if (!('entry' in bundle)) {
    throw new Error('Bundle must have an entry list')
  }

  return true
}

export type SavedBundleEntry<T extends Resource = Resource> = Omit<
  fhir3.BundleEntry<T>,
  'fullUrl' | 'resource'
> & {
  fullUrl: URLReference
  resource: SavedResource<T>
}

export type StrictBundle<T extends Resource[]> = Omit<Bundle, 'entry'> & {
  entry: { [Property in keyof T]: BundleEntry<T[Property]> }
}

export type Address = Omit<fhir3.Address, 'type' | 'extension'> & {
  type?: fhir3.Address['type'] | 'SECONDARY_ADDRESS' | 'PRIMARY_ADDRESS'
  extension?: Array<
    KnownExtensionType['http://opencrvs.org/specs/extension/part-of']
  >
}

export type BusinessStatus = Omit<fhir3.CodeableConcept, 'coding'> & {
  coding: Array<
    Omit<fhir3.Coding, 'code' | 'system'> & {
      system: 'http://opencrvs.org/specs/reg-status'
      code: RegistrationStatus
    }
  >
}

export type Composition = Omit<fhir3.Composition, 'relatesTo' | 'section'> & {
  section: Array<CompositionSection>
  relatesTo?: Array<
    Omit<fhir3.CompositionRelatesTo, 'code' | 'targetReference'> & {
      code: fhir3.CompositionRelatesTo['code'] | 'duplicate'
      targetReference: SavedReference
    }
  >
}

export type SavedComposition = Omit<Composition, 'section' | 'id'> & {
  id: UUID
  section: Array<SavedCompositionSection>
}

export type DocumentReference = WithStrictExtensions<
  Omit<fhir3.DocumentReference, 'indexed' | 'docStatus'>
> & {
  indexed?: string
  docStatus?: 'validated' | 'approved' | 'deleted'
}

export type RelatedPerson = WithStrictExtensions<
  Omit<fhir3.RelatedPerson, 'patient'>
> & {
  patient?: Reference
}
export type SavedRelatedPerson = Omit<RelatedPerson, 'id' | 'patient'> & {
  id: UUID
  patient: SavedReference
}

export type Location = WithStrictExtensions<
  Omit<fhir3.Location, 'address' | 'partOf'> & {
    address?: Address
    partOf?: {
      reference: ResourceIdentifier
    }
  }
>
export type SavedLocation = Omit<Location, 'partOf' | 'id'> & {
  id: UUID
  address?: Address
  partOf?: {
    reference: ResourceIdentifier
  }
}

export type SavedQuestionnaireResponse = Omit<
  QuestionnaireResponse,
  'status' | 'id'
> & {
  id: UUID
  status: 'completed'
}

export type CompositionHistory = Saved<Composition> & {
  resourceType: 'CompositionHistory'
}

export type SavedCompositionHistory = SavedComposition & {
  resourceType: 'CompositionHistory'
}

export function isComposition<T extends Resource>(
  resource: T
): resource is (T & Composition) | (T & SavedComposition) {
  return resource.resourceType === 'Composition'
}
export function isCompositionOrCompositionHistory<T extends Resource>(
  resource: T
): resource is (T & Composition) | (T & CompositionHistory) {
  return (
    resource.resourceType === 'Composition' ||
    resource.resourceType === 'CompositionHistory'
  )
}

export function isQuestionnaireResponse<T extends Resource>(
  resource: T
): resource is T & QuestionnaireResponse {
  return resource.resourceType === 'QuestionnaireResponse'
}

export function isDocumentReference<T extends Resource>(
  resource: T
): resource is T & DocumentReference {
  return resource.resourceType === 'DocumentReference'
}

export function getComposition<T extends Bundle>(bundle: T) {
  const composition = bundle.entry
    .map(({ resource }) => resource)
    .find(isComposition)

  if (!composition) {
    throw new Error('Composition not found in bundle')
  }

  return composition as T extends Saved<ValidRecord>
    ? SavedComposition
    : T extends SavedComposition
    ? SavedComposition
    : Composition
}

export function isRelatedPerson(resource: Resource): resource is RelatedPerson {
  return resource.resourceType === 'RelatedPerson'
}

export type FhirResourceType =
  | fhir3.FhirResource['resourceType']
  | 'TaskHistory'
  | 'CompositionHistory'

export type Identifier = fhir3.Identifier

export type Coding = fhir3.Coding
export type QuestionnaireResponse = fhir3.QuestionnaireResponse
export type CompositionRelatesTo = fhir3.CompositionRelatesTo

export type EncounterParticipant = Omit<
  fhir3.EncounterParticipant,
  'individual'
> & {
  individual: {
    reference: ResourceIdentifier | URNReference
  }
}

type ItemType<T> = T extends Array<infer U> ? U : never
export type TelecomSystem = ItemType<Patient['telecom']>['system']
export type CodeableConcept = fhir3.CodeableConcept

export function markSaved<T extends Resource>(resource: T, id: UUID | string) {
  return {
    ...resource,
    id
  } as Saved<T>
}

export function getResourceFromBundleById<T extends Resource = Resource>(
  bundle: Bundle,
  id: string
) {
  return getFromBundleById<T>(bundle, id).resource
}

export function findResourceFromBundleById<T extends Resource = Resource>(
  bundle: Bundle,
  id: string
) {
  try {
    return getFromBundleById<T>(bundle, id).resource
  } catch (error) {
    return null
  }
}

export function isSaved<T extends Resource>(
  resource: T
): resource is T & Saved<T> {
  return resource.id !== undefined
}

export function getFromBundleById<T extends Resource = Resource>(
  bundle: Bundle,
  id: string
): SavedBundleEntry<T> {
  const resource = bundle.entry?.find(
    (item) => isSaved(item.resource) && item.resource.id === id
  )

  if (!resource) {
    throw new Error('Resource not found in bundle with id ' + id)
  }

  if (!resource.fullUrl) {
    throw new Error(
      'A resource was found but it did not have a fullUrl. This should not happen.'
    )
  }

  return resource as SavedBundleEntry<T>
}

export function findEntryFromBundle<T extends Resource = Resource>(
  bundle: Bundle,
  reference: Reference['reference']
): BundleEntryWithFullUrl<T> | SavedBundleEntry<T> | undefined {
  return isURNReference(reference)
    ? bundle.entry.find(
        (entry): entry is BundleEntryWithFullUrl<T> =>
          entry.fullUrl === reference
      )
    : bundle.entry.find(
        (entry): entry is SavedBundleEntry<T> =>
          isSaved(entry.resource) &&
          entry.resource.id === resourceIdentifierToUUID(reference)
      )
}

export function findCompositionSection<T extends SavedComposition>(
  code: CompositionSectionCode,
  composition: T
): SavedCompositionSection

export function findCompositionSection<T extends Composition>(
  code: CompositionSectionCode,
  composition: T
): CompositionSection

export function findCompositionSection<T extends Composition>(
  code: CompositionSectionCode,
  composition: T
) {
  return (composition.section &&
    composition.section.find((section) => {
      if (!section.code || !section.code.coding || !section.code.coding.some) {
        return false
      }
      return section.code.coding.some((coding) => coding.code === code)
    })) as T extends SavedComposition
    ? SavedCompositionSection
    : CompositionSection
}

export function resourceToBundleEntry<T extends Resource>(
  resource: T
): BundleEntry<T> {
  return {
    resource,
    fullUrl: `urn:uuid:${resource.id as UUID}`
  }
}

export function resourceToSavedBundleEntry<T extends Resource>(
  resource: SavedResource<T>
): SavedBundleEntry<T> {
  return {
    resource,
    fullUrl:
      `/fhir/${resource.resourceType}/${resource.id}/_history/${resource.meta?.versionId}` as URLReference
  }
}

export function toHistoryResource<T extends Saved<Resource>>(resource: T) {
  return {
    ...resource,
    resourceType: `${resource.resourceType}History`
  } as T extends Task
    ? TaskHistory
    : T extends Composition
    ? CompositionHistory
    : never
}
export { updateFHIRBundle, buildFHIRBundle } from './transformers'
