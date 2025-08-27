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
import { NewLocations } from '@events/storage/postgres/events/schema/app/Locations'

export const Location = z.object({
  id: UUID,
  name: z.string(),
  partOf: UUID.nullable()
})
export const NewLocation = z.object({
  id: UUID,
  name: z.string(),
  parentId: UUID.nullable()
})
export const LocationUpdate = z.object({
  id: UUID,
  name: z.string().optional(),
  deletedAt: z.string().datetime().nullable().optional()
})

export type Location = z.infer<typeof Location>
export type LocationUpdate = z.infer<typeof LocationUpdate>

/**
 * Sets incoming locations in the database for events. Should be only run as part of the initial seeding.
 * @param incomingLocations - Locations to be set
 */

export async function setLocations(incomingLocations: Array<Location>) {
  return locationsRepo.setLocations(
    incomingLocations.map(({ id, name, partOf }) => ({
      id,
      name,
      parentId: partOf
    }))
  )
}

export const getLocations = async () => {
  const locations = await locationsRepo.getLocations()

  return locations.map(({ id, name, parentId }) => ({
    id,
    name,
    partOf: parentId
  }))
}

export const deleteLocations = async (locationIds: UUID[]) => {
  await locationsRepo.deleteLocations(locationIds)
}

export const addLocations = async (locations: Array<NewLocations>) => {
  await locationsRepo.addLocations(locations)
}

export const updateLocations = async (locations: Array<LocationUpdate>) => {
  await locationsRepo.updateLocations(locations)
}

export const getChildLocations = async (parentIdToSearch: string) => {
  const locations = await locationsRepo.getChildLocations(parentIdToSearch)

  return locations.map(({ id, name, parentId }) => ({
    id,
    name,
    partOf: parentId
  }))
}
