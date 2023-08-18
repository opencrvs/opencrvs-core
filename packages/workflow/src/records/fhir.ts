import { HEARTH_URL } from '@workflow/constants'
import fetch from 'node-fetch'

export type BundleEntry = Omit<fhir.BundleEntry, 'resource'> & {
  resource: fhir.Resource
}

export type Bundle = Omit<fhir.Bundle, 'entry'> & {
  entry: Array<BundleEntry>
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
