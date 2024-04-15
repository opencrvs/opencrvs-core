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
import { GATEWAY_URL } from '@config/config/constants'
import { ServerRoute } from '@hapi/hapi'
import { SavedBundle, Location, SavedLocation } from '@opencrvs/commons/types'

async function fetchLocations(type: 'ADMIN_STRUCTURE' | 'CRVS_OFFICE') {
  const locationUrl = new URL(
    `location?type=${type}&_count=0&status=active`,
    GATEWAY_URL
  )
  const locationsBundle = await fetch(locationUrl).then(async (res) => {
    if (!res.ok) {
      throw new Error('Failed to fetch locations')
    }
    return (await res.json()) as SavedBundle<Location>
  })
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

export const getOffices: ServerRoute['handler'] = async (req) => {
  const { locationId } = req.params as { locationId: string }
  const locations = await fetchLocations('ADMIN_STRUCTURE')
  const offices = await fetchLocations('CRVS_OFFICE')
  const locationsMap = new Map(locations.map((loc) => [loc.id, loc]))
  return offices.filter((office) => {
    const officeLocation = office.partOf?.reference.split('/').at(1)
    return officeLocation
      ? getHierarchy(officeLocation, locationsMap).includes(locationId)
      : false
  })
}
