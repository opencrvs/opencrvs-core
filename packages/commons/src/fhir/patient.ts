import { Resource } from '.'

export function isPatient(resource: Resource): resource is fhir3.Patient {
  return resource.resourceType === 'Patient'
}
