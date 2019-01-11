import fetch from 'node-fetch'
import { HEARTH_URL } from 'src/constants'

export interface ITemplatedComposition extends fhir.Composition {
  section?: fhir.CompositionSection[]
}

export function findCompositionSection(
  code: string,
  composition: ITemplatedComposition
) {
  return (
    composition.section &&
    composition.section.find((section: fhir.CompositionSection) => {
      if (!section.code || !section.code.coding || !section.code.coding.some) {
        return false
      }
      return section.code.coding.some(coding => coding.code === code)
    })
  )
}

export function findEntry(
  code: string,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
) {
  const patientSection = findCompositionSection(code, composition)
  if (!patientSection || !patientSection.entry) {
    return null
  }
  const reference = patientSection.entry[0].reference
  const entry =
    bundleEntries &&
    bundleEntries.find(
      (bundleEntry: fhir.BundleEntry) => bundleEntry.fullUrl === reference
    )
  return entry && entry.resource
}

export function findName(code: string, patient: fhir.Patient) {
  return (
    patient.name &&
    patient.name.find((name: fhir.HumanName) => name.use === code)
  )
}

export async function getCompositionByIdentifier(identifier: string) {
  const response = await getFromFhir(`/Composition?identifier${identifier}`)
  return response.entry[0]
}

export function addDuplicatesToComposition(
  duplicates: string[],
  composition: fhir.Composition
) {
  if (!composition.relatesTo) {
    composition.relatesTo = []
  }
  composition.relatesTo.concat(createDuplicateTemplate(duplicates))
  return postToHearth(composition)
}

function createDuplicateTemplate(duplicates: string[]) {
  return duplicates.map((duplicateIdentifier: string) => {
    return {
      code: 'duplicate',
      targetIdentifier: {
        value: duplicateIdentifier
      }
    }
  })
}

export const getFromFhir = (suffix: string) => {
  return fetch(`${HEARTH_URL}${suffix}`, {
    headers: {
      'Content-Type': 'application/json+fhir'
    }
  })
    .then(response => {
      return response.json()
    })
    .catch(error => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
    })
}

export async function postToHearth(payload: any) {
  /* hearth will do put calls if it finds id on the bundle */
  const res = await fetch(HEARTH_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })
  if (!res.ok) {
    throw new Error(
      `FHIR post to /fhir failed with [${res.status}] body: ${await res.text()}`
    )
  }
  return res.json()
}
