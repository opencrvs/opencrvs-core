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
  countUsers
} from '@metrics/api'
import { getPopulation, getLocationType } from '@metrics/features/metrics/utils'
import { IAuthHeader } from '@metrics/features/registration'

export async function getLocationStatistics(
  locationId: string | undefined,
  populationYear: number,
  authHeader: IAuthHeader
) {
  const response: Record<string, number> = {
    registrars: 0,
    offices: 0
  }

  if (locationId) {
    const location = await fetchLocation(locationId, authHeader)

    if (getLocationType(location) !== 'CRVS_OFFICE') {
      response.population = getPopulation(location, populationYear)
      const locationOffices = await fetchChildLocationsWithTypeByParentId(
        locationId,
        'CRVS_OFFICE',
        authHeader
      )

      for (const office of locationOffices) {
        response.offices += 1
        response.registrars +=
          (await countUsers(
            { primaryOfficeId: office.id, role: 'LOCAL_REGISTRAR' },
            authHeader
          )) || 0
      }
    } else {
      // if crvs office
      response.registrars +=
        (await countUsers(
          { primaryOfficeId: location.id, role: 'LOCAL_REGISTRAR' },
          authHeader
        )) || 0
    }
  } else {
    // country wide
    response.population = 0

    const childLocations = await fetchChildLocationsByParentId(
      'Location/0',
      authHeader
    )

    for (const each of childLocations) {
      response.population += getPopulation(each, populationYear) || 0
    }
    const locationOffices = await fetchLocationsByType(
      'CRVS_OFFICE',
      authHeader
    )

    for (const office of locationOffices) {
      response.offices += 1
      response.registrars +=
        (await countUsers(
          { primaryOfficeId: office.id, role: 'LOCAL_REGISTRAR' },
          authHeader
        )) || 0
    }
  }
  return response
}
