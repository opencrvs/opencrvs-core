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
  fetchChildLocationsWithTypeByParentId,
  fetchChildLocationsByParentId,
  fetchLocationsByType,
  countUsersByLocation,
  ICountByLocation
} from '@metrics/api'
import { getPopulation, getLocationType } from '@metrics/features/metrics/utils'
import { IAuthHeader } from '@metrics/features/registration'

interface ILocationStatisticsResponse {
  registrars: number
  population?: number
  offices: number
}

function getCRVSOfficeStatistics(
  location: fhir.Location,
  registrarsCountByLocation: Array<ICountByLocation>
) {
  const registrars =
    registrarsCountByLocation.find(
      ({ locationId }) => locationId === location.id
    )?.total || 0
  return {
    registrars,
    offices: 1
  }
}

async function getAdminLocationStatistics(
  location: fhir.Location,
  registrarsCountByLocation: Array<ICountByLocation>,
  populationYear: number,
  authHeader: IAuthHeader
): Promise<ILocationStatisticsResponse> {
  const population = getPopulation(location, populationYear)
  let offices = 0
  let registrars = 0
  const locationOffices = await fetchChildLocationsWithTypeByParentId(
    location.id as string,
    'CRVS_OFFICE',
    authHeader
  )
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
    if (getLocationType(location) !== 'CRVS_OFFICE') {
      return getAdminLocationStatistics(
        location,
        registrarsCountByLocation,
        populationYear,
        authHeader
      )
    } else {
      return getCRVSOfficeStatistics(location, registrarsCountByLocation)
    }
  } else {
    return getCountryWideLocationStatistics(
      populationYear,
      registrarsCountByLocation,
      authHeader
    )
  }
}
