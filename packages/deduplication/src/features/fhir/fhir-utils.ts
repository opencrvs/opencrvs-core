import fetch from 'node-fetch'
import { logger } from 'src/logger'
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
  try {
    const response = await getFromFhir(`/Composition?identifier=${identifier}`)
    return response.entry[0]
  } catch (error) {
    logger.error(
      `Deduplication/fhir-utils: getting composition by identifer failed with error: ${error}`
    )
    throw new Error(error)
  }
}

export function addDuplicatesToComposition(
  duplicates: string[],
  compositionEntry: fhir.BundleEntry
) {
  try {
    const composition = compositionEntry.resource as fhir.Composition
    const compositionIdentifier =
      composition.identifier && composition.identifier.value

    logger.info(
      `Deduplication/fhir-utils: updating composition(identifier: ${compositionIdentifier}) with duplicates ${duplicates}`
    )

    if (!composition.relatesTo) {
      composition.relatesTo = []
    }
    composition.relatesTo = composition.relatesTo.concat(
      createDuplicateTemplate(duplicates)
    )

    const bundle = {
      resourceType: 'Bundle',
      type: 'document',
      entry: [compositionEntry]
    }
    return postToHearth(bundle)
  } catch (error) {
    logger.error(
      `Deduplication/fhir-utils: updating composition failed with error: ${error}`
    )
    throw new Error(error)
  }
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
