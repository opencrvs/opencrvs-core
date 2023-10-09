// eslint-disable-next-line import/no-relative-parent-imports

import { ValidRecord } from 'src/record'
import { Nominal } from '../nominal'
import { UUID } from '../uuid'
import { Encounter, SavedEncounter } from './encounter'
import { Extension } from './extension'
import { Patient } from './patient'
import { CompositionSection, SavedCompositionSection } from './composition'
import { SavedTask, Task, TaskHistory } from './task'

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
export type ResourceIdentifier = `${FhirResource}/${UUID}`

// http://localhost:3447/fhir/Patient/3bd79ffd-5bd7-489f-b0d2-3c6133d36e1e/94d9feab-78f9-4de7-9b4b-a4bcbef04a57
export type URLReference = Nominal<string, 'URLReference'>

export function isURLReference(id: string): id is URLReference {
  return id.startsWith('http:')
}

export function urlReferenceToUUID(reference: URLReference) {
  const urlParts = reference.split('/')
  return urlParts[urlParts.length - 2] as UUID
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

export type BundleEntryWithFullUrl = Omit<fhir3.BundleEntry, 'fullUrl'> & {
  fullUrl: string
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
  'fullUrl'
> & {
  fullUrl: URLReference
  resource: SavedResource<T>
}

export type StrictBundle<T extends Resource[]> = Omit<Bundle, 'entry'> & {
  entry: { [Property in keyof T]: BundleEntry<T[Property]> }
}

export type Address = Omit<fhir3.Address, 'type'> & {
  type?: fhir3.Address['type'] | 'SECONDARY_ADDRESS' | 'PRIMARY_ADDRESS'
}

export type BusinessStatus = Omit<fhir3.CodeableConcept, 'coding'> & {
  coding: fhir3.Coding[]
}

export type Composition = Omit<fhir3.Composition, 'relatesTo' | 'section'> & {
  section: Array<CompositionSection>
  relatesTo?: Array<
    Omit<fhir3.CompositionRelatesTo, 'code'> & {
      code: fhir3.CompositionRelatesTo['code'] | 'duplicate'
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

export type RelatedPerson = Omit<fhir3.RelatedPerson, 'patient'> & {
  patient: {
    reference: URNReference | URLReference | ResourceIdentifier
  }
}
export type SavedRelatedPerson = Omit<RelatedPerson, 'id' | 'patient'> & {
  id: UUID
  patient: {
    reference: URLReference
  }
}

export type Location = WithStrictExtensions<
  Omit<fhir3.Location, 'address' | 'partOf'> & {
    address?: Address
    partOf?: {
      reference: ResourceIdentifier
    }
  }
>
export type SavedLocation = Omit<Location, 'partOf'> & {
  address?: Address
  partOf: {
    reference: ResourceIdentifier
  }
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

export function isRelatedPerson(
  resource: Resource
): resource is fhir3.RelatedPerson {
  return resource.resourceType === 'RelatedPerson'
}

export type FhirResource =
  | fhir3.FhirResource['resourceType']
  | 'TaskHistory'
  | 'CompositionHistory'

export type Identifier = fhir3.Identifier

export type Reference = Omit<fhir3.Reference, 'reference'> & {
  reference: URNReference | ResourceIdentifier | URLReference
}
export type SavedReference = Omit<Reference, 'reference'> & {
  reference: URLReference
}
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

export function markSaved<T extends Resource>(resource: T, id: UUID) {
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

export function isSaved(resource: Resource): resource is Saved<Resource> {
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

export function findCompositionSection<T extends SavedComposition>(
  code: string,
  composition: T
): SavedCompositionSection

export function findCompositionSection<T extends Composition>(
  code: string,
  composition: T
): CompositionSection

export function findCompositionSection<T extends Composition>(
  code: string,
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
