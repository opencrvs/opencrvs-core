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

function isTaskResource(resource: fhir.Resource): resource is fhir.Task {
  return resource.resourceType === 'Task'
}

function findPreviousTask(historyResponseBundle: fhir.Bundle) {
  return (
    historyResponseBundle.entry &&
    historyResponseBundle.entry
      .map(entry => entry.resource)
      .filter((resource): resource is fhir.Task =>
        Boolean(resource && isTaskResource(resource))
      )
      .find(resource => {
        if (!resource.businessStatus || !resource.businessStatus.coding) {
          return false
        }

        return resource.businessStatus.coding.some(
          coding => coding.code === 'DECLARED'
        )
      })
  )
}

export function getTask(bundle: fhir.Bundle) {
  return getResourceByType<fhir.Task>(bundle, FHIR_RESOURCE_TYPE.TASK)
}
export async function getPreviousTask(
  task: fhir.Task,
  authHeader: IAuthHeader
) {
  const taskHistory = (await fetchFHIR(
    `Task/${task.id}/_history`,
    authHeader
  )) as fhir.Bundle

  return findPreviousTask(taskHistory)
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

export function getResourceByType<T = fhir.Resource>(
  bundle: fhir.Bundle,
  type: string
): T | undefined {
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
  return bundleEntry && (bundleEntry.resource as T)
}

export enum FHIR_RESOURCE_TYPE {
  COMPOSITION = 'Composition',
  TASK = 'Task'
}

export function fetchFHIR<T = any>(
  suffix: string,
  authHeader: IAuthHeader,
  method: string = 'GET',
  body?: string
) {
  return fetch(`${fhirUrl}${suffix}`, {
    method,
    headers: {
      'Content-Type': 'application/fhir+json',
      ...authHeader
    },
    body
  })
    .then(response => {
      return response.json() as Promise<T>
    })
    .catch(error => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
    })
}
