/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import {
  CompositionSectionCode,
  Extension,
  findCompositionSection,
  getFromBundleById,
  KnownExtensionType,
  OpenCRVSPatientName,
  Resource,
  resourceIdentifierToUUID,
  SavedBundle,
  SavedComposition,
  SavedTask
} from '@opencrvs/commons/types'
import { FLAGGED_AS_POTENTIAL_DUPLICATE, FHIR_URL } from '@search/constants'
import {
  IBirthCompositionBody,
  ICompositionBody,
  IDeathCompositionBody
} from '@search/elasticsearch/utils'
import { logger } from '@search/logger'
import fetch from 'node-fetch'

export interface ITemplatedComposition extends fhir.Composition {
  section?: fhir.CompositionSection[]
}

export function findTask(bundleEntries?: fhir.BundleEntry[]) {
  const taskEntry = bundleEntries?.find(
    (entry) => entry?.resource?.resourceType === 'Task'
  )
  if (!taskEntry?.resource) throw new Error('No task resource found')
  return taskEntry.resource as fhir.Task
}

export function findPatient(bundle: fhir.Bundle) {
  return bundle.entry?.find(
    (entry) => entry?.resource?.resourceType === 'Patient'
  )?.resource as fhir.Patient | undefined
}

export function findTaskExtension<T extends keyof KnownExtensionType>(
  task: SavedTask,
  extensionUrl: T
) {
  return task.extension.find(
    (ext): ext is KnownExtensionType[T] => ext.url === extensionUrl
  )
}

export function findExtension<T extends keyof KnownExtensionType>(
  url: T,
  extensions: Extension[] | undefined
) {
  const extension =
    extensions &&
    extensions.find((obj): obj is KnownExtensionType[T] => {
      return obj.url === url
    })
  return extension
}

export function findTaskIdentifier(task?: SavedTask, identiferSystem?: string) {
  return (
    task &&
    task.identifier &&
    task.identifier.find((identifier) => identifier.system === identiferSystem)
  )
}

export function findEntry<T extends Resource = Resource>(
  code: CompositionSectionCode,
  composition: SavedComposition,
  bundle: SavedBundle
) {
  const patientSection = findCompositionSection(code, composition)
  if (!patientSection || !patientSection.entry) {
    return undefined
  }
  const reference = patientSection.entry[0].reference
  return getFromBundleById<T>(bundle, reference!.split('/')[1]).resource
}

export async function addEventLocation(
  body: IBirthCompositionBody | IDeathCompositionBody,
  code: CompositionSectionCode,
  composition: SavedComposition
) {
  let data
  let location: fhir.Location | undefined

  const encounterSection = findCompositionSection(code, composition)
  if (encounterSection && encounterSection.entry) {
    data = await getFromFhir(
      `/Encounter/${encounterSection.entry[0].reference}`
    )

    if (data && data.location && data.location[0].location) {
      location = await getFromFhir(`/${data.location[0].location.reference}`)
    }
  }

  if (location) {
    const isLocationHealthFacility =
      location.type &&
      location.type.coding &&
      location.type.coding.find((obCode) => obCode.code === 'HEALTH_FACILITY')

    if (isLocationHealthFacility) {
      body.eventLocationId = location.id
    } else {
      body.eventJurisdictionIds = []
      if (location.address?.country) {
        body.eventCountry = location.address.country
      }
      //eventLocationLevel1
      if (location.address?.state) {
        body.eventJurisdictionIds.push(location.address.state)
      }
      //eventLocationLevel2
      if (location.address?.district) {
        body.eventJurisdictionIds.push(location.address.district)
      }
      //eventLocationLevel3
      if (location.address?.line?.[10]) {
        body.eventJurisdictionIds.push(location.address.line[10])
      }
      //eventLocationLevel4
      if (location.address?.line?.[11]) {
        body.eventJurisdictionIds.push(location.address.line[11])
      }
      //eventLocationLevel5
      if (location.address?.line?.[12]) {
        body.eventJurisdictionIds.push(location.address.line[12])
      }
    }
  }
}

export function findEntryResourceByUrl<T extends fhir.Resource = fhir.Resource>(
  url?: string,
  bundleEntries?: fhir.BundleEntry[]
): T | undefined {
  const bundleEntry =
    bundleEntries &&
    bundleEntries.find((obj: fhir.BundleEntry) => obj.fullUrl === url)
  return bundleEntry && (bundleEntry.resource as T)
}
export function findName(
  code: string,
  names: fhir.HumanName[] | undefined
): fhir.HumanName | undefined
export function findName(
  code: string,
  names: OpenCRVSPatientName[] | undefined
): OpenCRVSPatientName | undefined
export function findName(
  code: string,
  names: (OpenCRVSPatientName | fhir.HumanName)[] | undefined
) {
  return names && names.find((name) => name.use === code)
}

export function findNameLocale(
  names: fhir.HumanName[] | undefined
): fhir.HumanName | undefined
export function findNameLocale(
  names: OpenCRVSPatientName[] | undefined
): OpenCRVSPatientName | undefined
export function findNameLocale(
  names: (OpenCRVSPatientName | fhir.HumanName)[] | undefined
) {
  return names && names.find((name) => name.use !== 'en')
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
  return fetch(`${FHIR_URL}${suffix}`, {
    headers: {
      'Content-Type': 'application/json+fhir'
    }
  })
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
    })
}

export async function updateInHearth(suffix: string, payload: any) {
  const res = await fetch(`${FHIR_URL}${suffix}`, {
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

export function selectObservationEntry(
  observationCode: string,
  bundleEntries?: fhir.BundleEntry[]
): fhir.BundleEntry | undefined {
  return bundleEntries
    ? bundleEntries.find((entry) => {
        if (entry.resource && entry.resource.resourceType === 'Observation') {
          const observationEntry = entry.resource as fhir.Observation
          const obCoding =
            observationEntry.code &&
            observationEntry.code.coding &&
            observationEntry.code.coding.find(
              (obCode) => obCode.code === observationCode
            )
          return obCoding ? true : false
        } else {
          return false
        }
      })
    : undefined
}

export async function fetchParentLocationByLocationID(locationID: string) {
  const location = await getFromFhir(`/${locationID}`)
  return location && location.partOf && location.partOf.reference
}

export async function getdeclarationJurisdictionIds(
  declarationLocationId?: string
) {
  if (!declarationLocationId) {
    return []
  }
  const locationHierarchyIds = [declarationLocationId]
  let locationId = `Location/${declarationLocationId}`
  while (locationId) {
    locationId = await fetchParentLocationByLocationID(locationId)
    if (locationId === 'Location/0') {
      break
    }
    locationHierarchyIds.push(locationId.split('/')[1])
  }
  return locationHierarchyIds
}

export async function fetchTaskByCompositionIdFromHearth(id: string) {
  const taskBundle: fhir.Bundle = await fetchHearth(
    `/Task?focus=Composition/${id}`
  )
  return taskBundle.entry?.[0]?.resource as fhir.Task
}

export async function addFlaggedAsPotentialDuplicate(
  duplicatesIds: string,
  compositionId: string
) {
  const task = await fetchTaskByCompositionIdFromHearth(compositionId)

  const extension = {
    url: FLAGGED_AS_POTENTIAL_DUPLICATE,
    valueString: duplicatesIds
  }

  task.lastModified = new Date().toISOString()
  task.extension = [...(task.extension ?? []), extension]

  await updateInHearth(`/Task/${task.id}`, task)
}

export const fetchHearth = async <T = any>(
  suffix: string,
  method = 'GET',
  body: string | undefined = undefined
): Promise<T> => {
  const res = await fetch(`${FHIR_URL}${suffix}`, {
    method: method,
    body,
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })

  if (!res.ok) {
    throw new Error(
      `FHIR get to /fhir failed with [${res.status}] body: ${await res.text()}`
    )
  }
  return res.json()
}

export function updateCompositionBodyWithDuplicateIds(
  composition: SavedComposition,
  body: ICompositionBody
) {
  const duplicates =
    composition.relatesTo?.filter((rel) => rel.code === 'duplicate') || []
  if (!duplicates.length) {
    return
  }
  logger.info(
    `Search/service:birth: ${duplicates.length} duplicate composition(s) found`
  )
  body.relatesTo = duplicates.map((rel) =>
    resourceIdentifierToUUID(rel.targetReference.reference)
  )
}
