import { Address, Resource, WithStrictExtensions } from '.'

export function isPatient<T extends Resource>(
  resource: T
): resource is T & Patient {
  return resource.resourceType === 'Patient'
}

export type PatientIdentifier = fhir3.Identifier & {
  otherType?: string
  fieldsModifiedByIdentity?: string[]
}

export type Patient = WithStrictExtensions<
  Omit<fhir3.Patient, 'name' | 'address' | 'identifier'> & {
    name: Array<OpenCRVSPatientName>
    address?: Address[]
    deceased?: boolean
    identifier?: PatientIdentifier[]
  }
>

export type OpenCRVSPatientName = Omit<fhir3.HumanName, 'use' | 'family'> & {
  use: string
  family: string[]
}
