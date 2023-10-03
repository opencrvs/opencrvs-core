// eslint-disable-next-line import/no-relative-parent-imports

import { Nominal } from 'src/nominal'
import { UUID } from 'src/uuid'
import { Extension } from './extension'

export * from './practitioner'
export * from './task'
export * from './extension'
export * from './payments'

export type Resource = fhir3.Resource

export type WithStrictExtensions<T extends Resource> = Omit<T, 'extension'> & {
  extension?: Array<Extension>
}

/*
 * Unsaved resource is a resource that has just been created and does not have an id yet
 */
export type UnsavedResource<T extends Resource> = Omit<T, 'id'>

export type Saved<T> = Omit<T, 'id'> & {
  id: string
}
export type URLReference = Nominal<string, 'URLReference'>

export type Bundle<T extends Resource = Resource> = Omit<
  fhir3.Bundle,
  'entry'
> & {
  entry: Array<BundleEntry<T>>
}

export type BundleEntry<T extends Resource = Resource> = Omit<
  fhir3.BundleEntry,
  'resource'
> & {
  resource: T
}

export type BundleEntryWithFullUrl = Omit<fhir3.BundleEntry, 'fullUrl'> & {
  fullUrl: string
}

export type Unsaved<T extends BundleEntry> = Omit<T, 'fullUrl' | 'resource'> & {
  fullUrl: `urn:uuid:${UUID}`
  resource: UnsavedResource<T['resource']>
}

export type StrictBundle<T extends Resource[]> = Omit<fhir3.Bundle, 'entry'> & {
  entry: { [Property in keyof T]: BundleEntry<T[Property]> }
}

export type OpenCRVSPatientName = Omit<fhir3.HumanName, 'use' | 'family'> & {
  use: string
  family: string[]
}

export type Address = Omit<fhir3.Address, 'type'> & {
  type?: fhir3.Address['type'] | 'SECONDARY_ADDRESS' | 'PRIMARY_ADDRESS'
}

export type BusinessStatus = Omit<fhir3.CodeableConcept, 'coding'> & {
  coding: fhir3.Coding[]
}

export type Composition = Omit<
  Saved<fhir3.Composition>,
  'relatesTo' | 'section'
> & {
  section: Array<CompositionSection>
  relatesTo?: Array<
    Omit<fhir3.CompositionRelatesTo, 'code'> & {
      code: fhir3.CompositionRelatesTo['code'] | 'duplicate'
    }
  >
}

export type DocumentReference = WithStrictExtensions<
  Saved<Omit<fhir3.DocumentReference, 'indexed' | 'docStatus'>> & {
    indexed?: string
    docStatus?: 'validated' | 'approved' | 'deleted'
  }
>

export type PatientIdentifier = fhir3.Identifier & {
  otherType?: string
  fieldsModifiedByIdentity?: string[]
}

export type Patient = WithStrictExtensions<
  Saved<
    Omit<fhir3.Patient, 'name' | 'address' | 'identifier'> & {
      name: Array<OpenCRVSPatientName>
      address?: Address[]
      deceased?: boolean
      identifier?: PatientIdentifier[]
    }
  >
>

export type RelatedPerson = Saved<fhir3.RelatedPerson>
export type Location = WithStrictExtensions<
  Saved<
    Omit<fhir3.Location, 'address'> & {
      address?: Address
    }
  >
>

export type Encounter = Saved<
  Omit<fhir3.Encounter, 'location'> & {
    location: Array<{
      location: {
        reference: URLReference
      }
    }>
  }
>
export type Observation = Saved<
  Omit<fhir3.Observation, 'valueQuantity'> & {
    valueQuantity?: Omit<fhir3.Quantity, 'value'> & {
      // Birth plurality of Pregnancy
      // { value: 'TWIN' }
      value: number | string
    }
  }
>

export function isComposition(resource: Resource): resource is Composition {
  return resource.resourceType === 'Composition'
}

export function isEncounter(resource: Resource): resource is Encounter {
  return resource.resourceType === 'Encounter'
}

export function isObservation(resource: Resource): resource is Observation {
  return resource.resourceType === 'Observation'
}

export function getComposition(bundle: Bundle) {
  const composition = bundle.entry
    .map(({ resource }) => resource)
    .find(isComposition)

  if (!composition) {
    throw new Error('Composition not found in bundle')
  }

  return composition
}

export function isRelatedPerson(
  resource: Resource
): resource is fhir3.RelatedPerson {
  return resource.resourceType === 'RelatedPerson'
}

export type Identifier = fhir3.Identifier
export type Reference = fhir3.Reference
export type Coding = fhir3.Coding
export type QuestionnaireResponse = fhir3.QuestionnaireResponse
export type CompositionRelatesTo = fhir3.CompositionRelatesTo

export type CompositionSection = fhir3.CompositionSection
export type EncounterParticipant = fhir3.EncounterParticipant

type ItemType<T> = T extends Array<infer U> ? U : never
export type TelecomSystem = ItemType<Patient['telecom']>['system']
export type CodeableConcept = fhir3.CodeableConcept

export function markSaved<T extends Resource>(
  resource: T,
  id: string
): Saved<T> {
  return {
    ...resource,
    id
  }
}
