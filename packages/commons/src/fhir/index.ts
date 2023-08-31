// eslint-disable-next-line import/no-relative-parent-imports
import { UUID } from '../uuid'

export * from './practitioner'
export * from './task'
export * from './extension'
export * from './payments'

export type Resource = fhir3.Resource
export type UnsavedResource<T extends Resource> = Omit<T, 'id'>
export type Saved<T> = Omit<T, 'id'> & {
  id: string
}

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

type Address = Omit<fhir3.Address, 'type'> & {
  type: 'SECONDARY_ADDRESS' | 'PRIMARY_ADDRESS'
}

export type Extension = fhir3.Extension

export type BusinessStatus = Omit<fhir3.CodeableConcept, 'coding'> & {
  coding: fhir3.Coding[]
}

export type Composition = Saved<fhir3.Composition>

export type DocumentReference = Saved<Omit<fhir3.DocumentReference, 'indexed'>>

export type Patient = Saved<
  Omit<fhir3.Patient, 'name' | 'address'> & {
    name: Array<OpenCRVSPatientName>
    address?: Address[]
    deceased?: boolean
  }
>
export type RelatedPerson = Saved<fhir3.RelatedPerson>
export type Location = Saved<fhir3.Location>
export type Encounter = Saved<fhir3.Encounter>
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

export function isEncounter(resource: Resource): resource is fhir3.Encounter {
  return resource.resourceType === 'Encounter'
}

export function isRelatedPerson(
  resource: Resource
): resource is fhir3.RelatedPerson {
  return resource.resourceType === 'RelatedPerson'
}
