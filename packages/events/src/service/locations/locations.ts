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

export const Location = z.object({
  id: UUID,
  externalId: z.string().nullable(),
  name: z.string(),
  partOf: UUID.nullable()
})

export type Location = z.infer<typeof Location>

/**
 * Sets incoming locations in the database for events. Should be only run as part of the initial seeding.
 * @param incomingLocations - Locations to be set
 */

export async function setLocations(incomingLocations: Array<Location>) {
  return locationsRepo.createLocations(
    incomingLocations.map(({ id, externalId, name, partOf }) => ({
      id,
      externalId,
      name,
      parentId: partOf
    }))
  )
}

export const getLocations = async () => {
  const locations = await locationsRepo.getLocations()

  return locations.map(({ id, externalId, name, parentId }) => ({
    id,
    externalId,
    name,
    partOf: parentId
  }))
}
