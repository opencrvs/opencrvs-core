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
  partOf: UUID.nullable(),
  status: z.enum(['active', 'inactive'])
})

export type Location = z.infer<typeof Location>

/**
 * Sets incoming locations in the database for events. Should be only run as part of the initial seeding.
 * @param incomingLocations - Locations to be set
 */

export async function syncLocations() {
  const locations = await config.getLocations()

  return locationsRepo.setLocations(
    locations.map(({ id, name, partOf }) => ({
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

export const getChildLocations = async (parentIdToSearch: string) => {
  const locations = await locationsRepo.getChildLocations(parentIdToSearch)

  return locations.map(({ id, name, parentId }) => ({
    id,
    name,
    partOf: parentId
  }))
}
