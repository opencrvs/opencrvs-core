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
  fetchChildLocationsByParentId,
  countRegistrarsByLocation,
  totalOfficesInCountry,
  fetchLocationsByType,
  fetchLocation
} from '@metrics/api'
import { getPopulation } from '@metrics/features/metrics/utils'
import { IAuthHeader } from '@metrics/features/registration'
import { OPENCRVS_SPECIFICATION_URL } from '@metrics/features/metrics/constants'

interface ILocationStatisticsResponse {
  registrars: number
  population: number
  offices: number
}

type Location = fhir.Location & { id: string }

type LocationsMap = Record<string, Location | undefined>

const OFFICE_COUNT_CACHE: Record<string, number | undefined> = {}

function dfs(
  locationsMap: LocationsMap,
  currentLocation: Location,
  adjacency: Record<string, string[] | undefined>
): number {
  if (
    OFFICE_COUNT_CACHE[currentLocation.id] &&
    OFFICE_COUNT_CACHE[currentLocation.id] !== -1
  ) {
    return OFFICE_COUNT_CACHE[currentLocation.id] as number
  }
  let offices = 0
  adjacency[currentLocation.id]?.forEach((childLocationId) => {
    const childLocation = locationsMap[childLocationId]
    /*
     * The offices are not present in the locationsMap
     * so when the child location is undefined, it means
     * that we have found an office
     */
    if (!childLocation) {
      offices++
      return
    }
    offices += dfs(locationsMap, childLocation, adjacency)
  })
  OFFICE_COUNT_CACHE[currentLocation.id] = offices
  return offices
}

async function cacheOfficeCount(authHeader: IAuthHeader) {
  const [locations, offices] = await Promise.all([
    fetchLocationsByType('ADMIN_STRUCTURE', authHeader),
    fetchLocationsByType('CRVS_OFFICE', authHeader)
  ])
  locations.forEach(({ id }) => (OFFICE_COUNT_CACHE[id] = -1))
  const locationsMap = locations.reduce<LocationsMap>(
    (locationsMap, location) => ({
      ...locationsMap,
      [location.id]: location
    }),
    {}
  )
  const adjacency: Record<string, string[] | undefined> = {}
  ;[...offices, ...locations].forEach((location) => {
    const partOf = location.partOf?.reference?.split('/')[1]
    const parentLocation = locationsMap[partOf ?? '']
    if (parentLocation) {
      adjacency[parentLocation.id] = [
        ...(adjacency[parentLocation.id] ?? []),
        location.id
      ]
    }
  })
  /*
   *  Run dfs from the top level locations
   */
  locations
    .filter(({ partOf }) => partOf?.reference?.split('/')[1] === '0')
    .forEach((location) => dfs(locationsMap, location, adjacency))
}

function isOffice(location: Location) {
  return (
    location.type?.coding?.find(
      ({ system }) => system === `${OPENCRVS_SPECIFICATION_URL}location-type`
    )?.code === 'CRVS_OFFICE'
  )
}

async function getAdminLocationStatistics(
  location: Location,
  registrars: number,
  populationYear: number,
  authHeader: IAuthHeader
): Promise<ILocationStatisticsResponse> {
  if (isOffice(location)) {
    return {
      population: 0,
      offices: 1,
      registrars
    }
  }
  if (!OFFICE_COUNT_CACHE[location.id]) {
    await cacheOfficeCount(authHeader)
  }
  return {
    population: getPopulation(location, populationYear),
    offices: OFFICE_COUNT_CACHE[location.id] ?? 0,
    registrars
  }
}

async function getCountryWideLocationStatistics(
  populationYear: number,
  registrars: number,
  authHeader: IAuthHeader
): Promise<ILocationStatisticsResponse> {
  let population = 0
  const [childLocations, offices] = await Promise.all([
    fetchChildLocationsByParentId('Location/0', authHeader),
    totalOfficesInCountry(authHeader)
  ])
  for (const each of childLocations) {
    population += getPopulation(each, populationYear) || 0
  }
  return {
    population,
    offices,
    registrars
  }
}

export async function getLocationStatistics(
  locationId: string | undefined,
  populationYear: number,
  authHeader: IAuthHeader
): Promise<ILocationStatisticsResponse> {
  locationId = locationId?.split('/')[1]
  const { registrars } = await countRegistrarsByLocation(authHeader, locationId)

  if (locationId) {
    const location = await fetchLocation(locationId, authHeader)
    return getAdminLocationStatistics(
      location,
      registrars,
      populationYear,
      authHeader
    )
  } else {
    return getCountryWideLocationStatistics(
      populationYear,
      registrars,
      authHeader
    )
  }
}
