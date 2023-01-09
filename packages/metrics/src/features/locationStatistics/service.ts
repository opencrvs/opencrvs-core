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
import {
  fetchChildLocationsByParentId,
  countRegistrarsByLocation,
  totalOfficesInCountry,
  fetchLocationsByType
} from '@metrics/api'
import { getPopulation } from '@metrics/features/metrics/utils'
import { IAuthHeader } from '@metrics/features/registration'

interface ILocationStatisticsResponse {
  registrars: number
  population: number
  offices: number
}

function isUnderJurisdiction(
  locationsMap: Record<string, fhir.Location>,
  jurisdictionId: string,
  location: fhir.Location
): boolean {
  const partOf = location.partOf?.reference?.split('/')[1]
  // already at the highest level
  if (!partOf || partOf === '0') return false
  if (partOf === jurisdictionId) return true
  return isUnderJurisdiction(locationsMap, jurisdictionId, locationsMap[partOf])
}

async function getAdminLocationStatistics(
  locationId: string,
  registrars: number,
  populationYear: number,
  authHeader: IAuthHeader
): Promise<ILocationStatisticsResponse> {
  const [locations, offices] = await Promise.all([
    fetchLocationsByType('ADMIN_STRUCTURE', authHeader),
    fetchLocationsByType('CRVS_OFFICE', authHeader)
  ])
  const locationsMap = locations.reduce<Record<string, fhir.Location>>(
    (locationsMap, location) => ({
      ...locationsMap,
      [location.id]: location
    }),
    {}
  )
  return {
    population:
      locationsMap[locationId] &&
      getPopulation(locationsMap[locationId], populationYear),
    offices: offices.reduce<number>(
      (total, office) =>
        total + Number(isUnderJurisdiction(locationsMap, locationId, office)),
      0
    ),
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
    return getAdminLocationStatistics(
      locationId,
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
