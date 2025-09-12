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

import { z } from 'zod'
import { UUID } from '@opencrvs/commons'
import * as locationsRepo from '@events/storage/postgres/events/locations'
import * as config from '@events/service/config/config'

export const Location = z.object({
  id: UUID,
  name: z.string(),
  parentId: UUID.nullable(),
  validUntil: z.string().nullable(),
  locationType: z
    .enum(['HEALTH_FACILITY', 'CRVS_OFFICE', 'ADMIN_STRUCTURE'])
    .nullable()
})

export type Location = z.infer<typeof Location>

/**
 * Sets incoming locations in the database for events. Should be only run as part of the initial seeding.
 * @param incomingLocations - Locations to be set
 */

export async function setLocations(locations: Location[]) {
  return locationsRepo.setLocations(
    locations.map(({ id, name, parentId, validUntil, locationType }) => ({
      id,
      name,
      parentId: parentId,
      validUntil: validUntil ? new Date(validUntil).toISOString() : null,
      locationType
    }))
  )
}

/**
 * Syncs locations from V1 to V2 database.
 * @param incomingLocations - Locations to be set
 */

export async function syncLocations() {
  const locations = await config.getLocations()
  return setLocations(locations)
}

export const getLocations = async (isActive = true) => {
  const locations = await locationsRepo.getLocations(isActive)

  return locations.map(({ id, name, parentId, validUntil, locationType }) => ({
    id,
    name,
    parentId,
    validUntil: validUntil ? validUntil : null,
    locationType
  }))
}

export const getChildLocations = async (parentIdToSearch: string) => {
  const locations = await locationsRepo.getChildLocations(parentIdToSearch)

  return locations.map(({ id, name, parentId, validUntil, locationType }) => ({
    id,
    name,
    validUntil,
    parentId,
    locationType
  }))
}
