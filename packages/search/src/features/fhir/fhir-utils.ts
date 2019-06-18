import fetch from 'node-fetch'
import { HEARTH_URL } from '@search/constants'
import { logger } from '@search/logger'

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

export function findTask(
  bundleEntries?: fhir.BundleEntry[]
): fhir.Task | undefined {
  const taskEntry: fhir.BundleEntry | undefined =
    bundleEntries &&
    bundleEntries.find(entry => {
      if (entry && entry.resource) {
        return entry.resource.resourceType === 'Task'
      } else {
        return false
      }
    })
  return taskEntry && (taskEntry.resource as fhir.Task)
}

export function findTaskExtension(task?: fhir.Task, extensionUrl?: string) {
  return (
    task &&
    task.extension &&
    task.extension.find(
      extension => extension && extension.url === extensionUrl
    )
  )
}

export function findTaskIdentifier(task?: fhir.Task, identiferSystem?: string) {
  return (
    task &&
    task.identifier &&
    task.identifier.find(identifier => identifier.system === identiferSystem)
  )
}

export function findEntry(
  code: string,
  composition: fhir.Composition,
  bundleEntries?: fhir.BundleEntry[]
): fhir.Resource | undefined {
  const patientSection = findCompositionSection(code, composition)
  if (!patientSection || !patientSection.entry) {
    return undefined
  }
  const reference = patientSection.entry[0].reference
  return findEntryResourceByUrl(reference, bundleEntries)
}

export function findEntryResourceByUrl(
  url?: string,
  bundleEntries?: fhir.BundleEntry[]
) {
  const bundleEntry =
    bundleEntries &&
    bundleEntries.find((obj: fhir.BundleEntry) => obj.fullUrl === url)
  return bundleEntry && bundleEntry.resource
}

export function findName(code: string, patient: fhir.Patient) {
  return (
    patient.name &&
    patient.name.find((name: fhir.HumanName) => name.use === code)
  )
}

export async function getCompositionById(id: string) {
  try {
    return await getFromFhir(`/Composition/${id}`)
  } catch (error) {
    logger.error(
      `Search/fhir-utils: getting composition by identifer failed with error: ${error}`
    )
    throw new Error(error)
  }
}

export function addDuplicatesToComposition(
  duplicates: string[],
  composition: fhir.Composition
) {
  try {
    const compositionIdentifier =
      composition.identifier && composition.identifier.value

    logger.info(
      `Search/fhir-utils: updating composition(identifier: ${compositionIdentifier}) with duplicates ${duplicates}`
    )

    if (!composition.relatesTo) {
      composition.relatesTo = []
    }

    createDuplicatesTemplate(duplicates, composition)
  } catch (error) {
    logger.error(
      `Search/fhir-utils: updating composition failed with error: ${error}`
    )
    throw new Error(error)
  }
}

export function createDuplicatesTemplate(
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
          reference: `Composition/${duplicateReference}`
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
          `Composition/${duplicateReference}`
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

export async function updateInHearth(payload: any, id?: string) {
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
