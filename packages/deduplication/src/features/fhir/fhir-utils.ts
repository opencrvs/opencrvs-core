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
    return response.entry[0].resource
  } catch (error) {
    logger.error(
      `Deduplication/fhir-utils: getting composition by identifer failed with error: ${error}`
    )
    throw new Error(error)
  }
}

export function addDuplicatesToComposition(
  duplicates: string[],
  composition: fhir.Composition
) {
  try {
    // const composition = compositionEntry.resource as fhir.Composition
    const compositionIdentifier =
      composition.identifier && composition.identifier.value

    logger.info(
      `Deduplication/fhir-utils: updating composition(identifier: ${compositionIdentifier}) with duplicates ${duplicates}`
    )

    if (!composition.relatesTo) {
      composition.relatesTo = []
    }

    createDuplicateTemplate(duplicates, composition)
  } catch (error) {
    logger.error(
      `Deduplication/fhir-utils: updating composition failed with error: ${error}`
    )
    throw new Error(error)
  }
}

export function createDuplicateTemplate(
  duplicates: string[],
  composition: fhir.Composition
) {
  return duplicates.map((duplicateReference: string) => {
    if (
      !existsAsDuplicate(duplicateReference, composition.relatesTo) &&
      composition.relatesTo
    ) {
      composition.relatesTo.push({
        code: 'duplicate',
        targetReference: {
          reference: `${duplicateReference}`
        }
      })
    }
  })
}

function existsAsDuplicate(
  duplicateReference: string,
  relatesToValues?: fhir.CompositionRelatesTo[]
) {
  return (
    relatesToValues &&
    relatesToValues.find(
      (relatesTo: fhir.CompositionRelatesTo) =>
        relatesTo.code === 'duplicate' &&
        (relatesTo.targetReference && relatesTo.targetReference.reference) ===
          duplicateReference
    )
  )
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

export async function postToHearth(payload: any, id?: string) {
  const res = await fetch(`${HEARTH_URL}/Composition/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })
  if (!res.ok) {
    throw new Error(
      `FHIR put to /fhir failed with [${res.status}] body: ${await res.text()}`
    )
  }

  const text = await res.text()
  return typeof text === 'string' ? text : JSON.parse(text)
}
