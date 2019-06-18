import fetch from 'node-fetch'
import { IAuthHeader } from '@metrics/features/registration'
import { fhirUrl } from '@metrics/constants'

export function getSectionBySectionCode(
  bundle: fhir.Bundle,
  sectionCode: string
): fhir.Patient {
  const composition: fhir.Composition = getResourceByType(
    bundle,
    FHIR_RESOURCE_TYPE.COMPOSITION
  ) as fhir.Composition
  const personSection =
    composition &&
    composition.section &&
    composition.section.find((section: fhir.CompositionSection) => {
      if (!section.code || !section.code.coding || !section.code.coding.some) {
        return false
      }
      return section.code.coding.some(coding => coding.code === sectionCode)
    })

  if (!personSection || !personSection.entry) {
    throw new Error(`No section found for given code: ${sectionCode}`)
  }
  const sectionRef = personSection.entry[0].reference
  const personEntry =
    bundle.entry &&
    bundle.entry.find((entry: any) => entry.fullUrl === sectionRef)

  if (!personEntry) {
    throw new Error(
      'Patient referenced from composition section not found in FHIR bundle'
    )
  }
  return personEntry.resource as fhir.Patient
}

export function getRegLastLocation(bundle: fhir.Bundle) {
  const task: fhir.Task = getResourceByType(
    bundle,
    FHIR_RESOURCE_TYPE.TASK
  ) as fhir.Task
  if (!task) {
    throw new Error('Task not found!')
  }
  const regLastLocation =
    task.extension &&
    task.extension.find(
      extension =>
        extension.url === 'http://opencrvs.org/specs/extension/regLastLocation'
    )

  return (
    regLastLocation &&
    regLastLocation.valueReference &&
    regLastLocation.valueReference.reference
  )
}

export async function fetchParentLocationByLocationID(
  locationID: string,
  authHeader: IAuthHeader
) {
  const location = await fetchFHIR(locationID, authHeader)
  return location && location.partOf && location.partOf.reference
}

export function getResourceByType(
  bundle: fhir.Bundle,
  type: string
): fhir.Resource | undefined {
  const bundleEntry =
    bundle &&
    bundle.entry &&
    bundle.entry.find(entry => {
      if (!entry.resource) {
        return false
      } else {
        return entry.resource.resourceType === type
      }
    })
  return bundleEntry && (bundleEntry.resource as fhir.Resource)
}

export enum FHIR_RESOURCE_TYPE {
  COMPOSITION = 'Composition',
  TASK = 'Task'
}

export const fetchFHIR = (
  suffix: string,
  authHeader: IAuthHeader,
  method: string = 'GET',
  body: string | undefined = undefined
) => {
  return fetch(`${fhirUrl}${suffix}`, {
    method,
    headers: {
      'Content-Type': 'application/fhir+json',
      ...authHeader
    },
    body
  })
    .then(response => {
      return response.json()
    })
    .catch(error => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
    })
}
