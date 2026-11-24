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

import { Location, UUID } from '@opencrvs/commons'
import * as locationsRepo from '@events/storage/postgres/administrative-hierarchy/locations'

/**
 * Sets incoming locations in the database for events. Should be only run as part of the initial seeding.
 * @param incomingLocations - Locations to be set
 */
export async function setLocations(locations: Location[]) {
  await locationsRepo.setLocations(
    locations.map(
      ({
        id,
        name,
        administrativeAreaId,
        validUntil,
        locationType,
        externalId
      }) => ({
        id,
        name,
        administrativeAreaId,
        validUntil: validUntil ? new Date(validUntil).toISOString() : null,
        locationType,
        externalId
      })
    )
  )
}

/**
 * NOTE: Be cautious when calling this function as it fetches all locations from the database.
 * Do you really need all of them? Consider using more specific functions if possible. Act as if there could be hundreds of thousands of locations.
 *
 */
export async function getLocations(params?: {
  locationType?: string
  locationIds?: UUID[]
  isActive?: boolean
  externalId?: string
}) {
  const locations = await locationsRepo.getLocations(params)

  return locations
}

export async function getLocationById(locationId: UUID) {
  const location = await locationsRepo.getLocationById(locationId)

  if (!location) {
    throw new Error(`Location with id ${locationId} not found`)
  }

  return location
}

export const getLocationHierarchy = async (locationId: UUID) => {
  return locationsRepo.getAdministrativeHierarchyById(locationId)
}
