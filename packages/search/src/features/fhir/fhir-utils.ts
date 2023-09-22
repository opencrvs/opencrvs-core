/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { FLAGGED_AS_POTENTIAL_DUPLICATE, HEARTH_URL } from '@search/constants'
import {
  IBirthCompositionBody,
  IDeathCompositionBody
} from '@search/elasticsearch/utils'
import { logger } from '@search/logger'
import fetch from 'node-fetch'

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
      return section.code.coding.some((coding) => coding.code === code)
    })
  )
}

export function findTask(bundleEntries?: fhir.BundleEntry[]) {
  const taskEntry = bundleEntries?.find(
    (entry) => entry?.resource?.resourceType === 'Task'
  )
  return taskEntry?.resource as fhir.Task | undefined
}

export function findPatient(bundle: fhir.Bundle) {
  return bundle.entry?.find(
    (entry) => entry?.resource?.resourceType === 'Patient'
  )?.resource as fhir.Patient | undefined
}

export function findTaskExtension(task?: fhir.Task, extensionUrl?: string) {
  return (
    task &&
    task.extension &&
    task.extension.find(
      (extension) => extension && extension.url === extensionUrl
    )
  )
}

export function findExtension(
  url: string,
  extensions: fhir.Extension[]
): fhir.Extension | undefined {
  const extension =
    extensions &&
    extensions.find((obj: fhir.Extension) => {
      return obj.url === url
    })
  return extension
}

export function findTaskIdentifier(task?: fhir.Task, identiferSystem?: string) {
  return (
    task &&
    task.identifier &&
    task.identifier.find((identifier) => identifier.system === identiferSystem)
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

export async function addEventLocation(
  body: IBirthCompositionBody | IDeathCompositionBody,
  code: string,
  composition: fhir.Composition
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

export function findEntryResourceByUrl(
  url?: string,
  bundleEntries?: fhir.BundleEntry[]
) {
  const bundleEntry =
    bundleEntries &&
    bundleEntries.find((obj: fhir.BundleEntry) => obj.fullUrl === url)
  return bundleEntry && bundleEntry.resource
}

export function findName(code: string, names: fhir.HumanName[] | undefined) {
  return names && names.find((name: fhir.HumanName) => name.use === code)
}

export function findNameLocale(names: fhir.HumanName[] | undefined) {
  return names && names.find((name: fhir.HumanName) => name.use !== 'en')
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
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
    })
}

export async function updateInHearth(suffix: string, payload: any) {
  const res = await fetch(`${HEARTH_URL}${suffix}`, {
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
  const locationHirarchyIds = [declarationLocationId]
  let locationId = `Location/${declarationLocationId}`
  while (locationId) {
    locationId = await fetchParentLocationByLocationID(locationId)
    if (locationId === 'Location/0') {
      break
    }
    locationHirarchyIds.push(locationId.split('/')[1])
  }
  return locationHirarchyIds
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
  const res = await fetch(`${HEARTH_URL}${suffix}`, {
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
