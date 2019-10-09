import { IAuthHeader } from '@metrics/features/registration'
import { fetchTaskHistory } from '@metrics/api'

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

export type APPLICATION_STATUS = 'DECLARED' | 'REGISTERED'

function findPreviousTask(
  historyResponseBundle: fhir.Bundle,
  previousState: APPLICATION_STATUS
) {
  const task =
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
          coding => coding.code === previousState
        )
      })

  if (!task) {
    return null
  }
  return task as Task
}

export type Task = fhir.Task & { id: string }
export type Composition = fhir.Composition & { id: string }

export function getTask(bundle: fhir.Bundle) {
  return getResourceByType<Task>(bundle, FHIR_RESOURCE_TYPE.TASK)
}

export function getComposition(bundle: fhir.Bundle) {
  return getResourceByType<Composition>(bundle, FHIR_RESOURCE_TYPE.COMPOSITION)
}

export async function getPreviousTask(
  task: Task,
  previousState: APPLICATION_STATUS,
  authHeader: IAuthHeader
) {
  const taskHistory = await fetchTaskHistory(task.id, authHeader)
  return findPreviousTask(taskHistory, previousState)
}

export function getApplicationStatus(task: Task): APPLICATION_STATUS | null {
  if (!task.businessStatus || !task.businessStatus.coding) {
    return null
  }

  const coding = task.businessStatus.coding.find(
    ({ system }) => system === 'http://opencrvs.org/specs/reg-status'
  )
  if (!coding) {
    return null
  }
  return coding.code as APPLICATION_STATUS
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
