import { HEARTH_URL } from '@workflow/constants'
import fetch from 'node-fetch'

export type TaskWithoutId = Omit<fhir.Task, 'id'>
export type Task = TaskWithoutId & { id: string; lastModified: string }

export type BundleEntry<T extends fhir.Resource = fhir.Resource> = Omit<
  fhir.BundleEntry,
  'resource'
> & {
  resource: T
}

export type Bundle<T extends fhir.Resource = fhir.Resource> = Omit<
  fhir.Bundle,
  'entry'
> & {
  entry: Array<BundleEntry<T>>
}

export type BundleEntryWithFullUrl = Omit<fhir.BundleEntry, 'fullUrl'> & {
  fullUrl: string
}

export function findFromBundleById(
  bundle: fhir.Bundle,
  id: string
): BundleEntryWithFullUrl {
  const resource = bundle.entry?.find((item) => item.resource?.id === id)

  if (!resource) {
    throw new Error('Resource not found in bundle with id ' + id)
  }

  if (!resource.fullUrl) {
    throw new Error(
      'A resource was found but it did not have a fullUrl. This should not happen.'
    )
  }

  return resource as BundleEntryWithFullUrl
}

export function isComposition(
  resource: fhir.Resource
): resource is fhir.Composition {
  return resource.resourceType === 'Composition'
}
export function isEncounter(
  resource: fhir.Resource
): resource is fhir.Encounter {
  return resource.resourceType === 'Encounter'
}
export function isRelatedPerson(
  resource: fhir.Resource
): resource is fhir.RelatedPerson {
  return resource.resourceType === 'RelatedPerson'
}
export function isTask(
  resource: fhir.Resource
): resource is Omit<fhir.Task, 'focus'> & { focus: { reference: string } } {
  return resource.resourceType === 'Task'
}

export async function sendBundleToHearth(
  payload: fhir.Bundle
): Promise<fhir.Bundle> {
  const res = await fetch(HEARTH_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })

  if (!res.ok) {
    throw new Error(
      `FHIR post to /fhir failed with [${res.status}] body: ${res.statusText}`
    )
  }

  return res.json()
}

export async function getTaskHistory(taskId: string): Promise<Bundle<Task>> {
  const res = await fetch(
    new URL(`/fhir/Task/${taskId}/_history?_count=100`, HEARTH_URL).href,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/fhir+json'
      }
    }
  )
  if (!res.ok) {
    throw new Error(
      `Fetching task history from Hearth failed with [${res.status}] body: ${res.statusText}`
    )
  }

  return res.json()
}

export function sortTasksDescending(tasks: Task[]) {
  return tasks.slice().sort((a, b) => {
    return (
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
  })
}
