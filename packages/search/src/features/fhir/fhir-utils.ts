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
  Encounter,
  Extension,
  findCompositionSection,
  findResourceFromBundleById,
  getComposition,
  getFromBundleById,
  KnownExtensionType,
  Location,
  OpenCRVSPatientName,
  Resource,
  resourceIdentifierToUUID,
  SavedBundle,
  SavedComposition,
  SavedLocation,
  SavedTask
} from '@opencrvs/commons/types'
import { FHIR_URL } from '@search/constants'
import { ICompositionBody } from '@search/elasticsearch/utils'
import { logger } from '@search/logger'
import fetch from 'node-fetch'

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

export function addEventLocation(
  bundle: SavedBundle,
  body: ICompositionBody,
  code: Extract<
    CompositionSectionCode,
    'birth-encounter' | 'death-encounter' | 'marriage-encounter'
  >
) {
  const composition = getComposition(bundle)

  const encounterSection = findCompositionSection(code, composition)

  if (!encounterSection) {
    return
  }

  const encounter = findResourceFromBundleById<Encounter>(
    bundle,
    resourceIdentifierToUUID(encounterSection.entry[0].reference)
  )

  if (!encounter || !encounter.location) {
    return
  }

  const location = findResourceFromBundleById<Location>(
    bundle,
    resourceIdentifierToUUID(encounter.location[0].location.reference)
  )

  if (!location) {
    return
  }

  const isLocationHealthFacility = location.type?.coding?.some(
    (obCode) => obCode.code === 'HEALTH_FACILITY'
  )

  if (isLocationHealthFacility) {
    body.eventLocationId = location.id
    return
  }

  if (location.address?.country) {
    body.eventCountry = location.address.country
  }

  body.eventJurisdictionIds = [
    location.address?.state, //eventLocationLevel1
    location.address?.district, //eventLocationLevel2
    location.address?.line?.[10], //eventLocationLevel3
    location.address?.line?.[11], //eventLocationLevel4
    location.address?.line?.[12] //eventLocationLevel5
  ].filter((maybeString): maybeString is string => Boolean(maybeString))
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

async function getFromFhir<T>(suffix: string): Promise<T> {
  const response = await fetch(`${FHIR_URL}${suffix}`, {
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })
  if (!response.ok) {
    throw new Error(
      `FHIR request failed: code [${
        response.status
      }] body: ${await response.text()}`
    )
  }
  return await response.json()
}

export async function fetchParentLocationByLocationID(locationID: string) {
  const location = await getFromFhir<SavedLocation>(`/${locationID}`)
  return location.partOf?.reference
}

async function fetchLocations(type: 'ADMIN_STRUCTURE' | 'CRVS_OFFICE') {
  const locationsBundle = await getFromFhir<SavedBundle<Location>>(
    `/Location?type=${type}&_count=0&status=active`
  )
  return locationsBundle.entry.map((e) => e.resource)
}

function getHierarchy(
  locationId: string,
  locationsMap: Map<string, SavedLocation>
): string[] {
  if (locationId == '0') {
    return []
  }
  const parentLocationId = locationsMap
    .get(locationId)
    ?.partOf?.reference.split('/')
    .at(1)
  if (!parentLocationId) {
    return [locationId]
  }
  return [locationId, ...getHierarchy(parentLocationId, locationsMap)]
}

export async function getBottommostLocations(parentLocationIds: string[]) {
  const locations = await fetchLocations('ADMIN_STRUCTURE')
  const locationsMap = new Map(locations.map((loc) => [loc.id, loc]))
  return locations.filter((location) => {
    const locationHierarchy = getHierarchy(location.id, locationsMap)
    return parentLocationIds.every((parentLocationId) =>
      locationHierarchy.includes(parentLocationId)
    )
  })
}

export async function getOffices(parentLocationId: string) {
  const locations = await fetchLocations('ADMIN_STRUCTURE')
  const offices = await fetchLocations('CRVS_OFFICE')
  const locationsMap = new Map(locations.map((loc) => [loc.id, loc]))
  return offices.filter((office) => {
    const officeLocationId = office.partOf?.reference.split('/').at(1)
    return officeLocationId
      ? getHierarchy(officeLocationId, locationsMap).includes(parentLocationId)
      : false
  })
}

export async function getdeclarationJurisdictionIds(
  declarationLocationId?: string
) {
  if (!declarationLocationId) {
    return []
  }
  const locationHierarchyIds = [declarationLocationId]
  let locationId: string | undefined = `Location/${declarationLocationId}`
  while (locationId) {
    locationId = await fetchParentLocationByLocationID(locationId)
    if (!locationId || locationId === 'Location/0') {
      break
    }
    locationHierarchyIds.push(locationId.split('/')[1])
  }
  return locationHierarchyIds
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
