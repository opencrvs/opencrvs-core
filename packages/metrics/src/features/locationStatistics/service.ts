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
  fetchLocation,
  fetchChildLocationsByParentId,
  fetchLocationsByType,
  countUsersByLocation,
  ICountByLocation,
  fetchAllChildLocationsByParentId
} from '@metrics/api'
import { getPopulation, getLocationType } from '@metrics/features/metrics/utils'
import { IAuthHeader } from '@metrics/features/registration'

interface ILocationStatisticsResponse {
  registrars: number
  population: number
  offices: number
}

async function getAdminLocationStatistics(
  location: fhir.Location,
  registrarsCountByLocation: Array<ICountByLocation>,
  populationYear: number,
  authHeader: IAuthHeader,
  cumulativeResult: ILocationStatisticsResponse = {
    population: 0,
    offices: 0,
    registrars: 0
  }
): Promise<ILocationStatisticsResponse> {
  if (!cumulativeResult.population) {
    cumulativeResult.population = getPopulation(location, populationYear)
  }

  const childLocations = await fetchAllChildLocationsByParentId(
    location.id as string,
    authHeader
  )

  for (const each of childLocations) {
    if (getLocationType(each) === 'CRVS_OFFICE') {
      cumulativeResult.offices += 1
      cumulativeResult.registrars +=
        registrarsCountByLocation.find(
          ({ locationId }) => locationId === each.id
        )?.total || 0
    } else {
      await getAdminLocationStatistics(
        each,
        registrarsCountByLocation,
        populationYear,
        authHeader,
        cumulativeResult
      )
    }
  }

  return cumulativeResult
}

async function getCountryWideLocationStatistics(
  populationYear: number,
  registrarsCountByLocation: Array<ICountByLocation>,
  authHeader: IAuthHeader
): Promise<ILocationStatisticsResponse> {
  let population = 0
  let offices = 0
  let registrars = 0
  const childLocations = await fetchChildLocationsByParentId(
    'Location/0',
    authHeader
  )
  for (const each of childLocations) {
    population += getPopulation(each, populationYear) || 0
  }
  const locationOffices = await fetchLocationsByType('CRVS_OFFICE', authHeader)
  for (const office of locationOffices) {
    offices += 1
    registrars +=
      registrarsCountByLocation.find(
        ({ locationId }) => locationId === office.id
      )?.total || 0
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
  const registrarsCountByLocation = await countUsersByLocation(
    { role: 'LOCAL_REGISTRAR' },
    authHeader
  )
  if (locationId) {
    const location = await fetchLocation(locationId, authHeader)
    return getAdminLocationStatistics(
      location,
      registrarsCountByLocation,
      populationYear,
      authHeader
    )
  } else {
    return getCountryWideLocationStatistics(
      populationYear,
      registrarsCountByLocation,
      authHeader
    )
  }
}
