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

export const Location = z.object({
  id: z.string(),
  externalId: z.string().nullable(),
  name: z.string(),
  partOf: z.string().nullable()
})

export type Location = z.infer<typeof Location>

/**
 * Sets incoming locations in the database for events. Should be only run as part of the initial seeding.
 * Clears all existing locations that are not in the incoming locations.
 *
 * @TODO: Consider removing the conditional logic after setting up dev environments for all devs.
 * In production it is run only once, and without transactions it is possible that the locations are not set correctly.
 *
 * @param incomingLocations - Locations to be set
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function setLocations(_incomingLocations: Array<Location>) {
  // eslint-disable-next-line no-console
  console.error('setLocations is not implemented yet')
  // const db = await events.getClient()
  // const currentLocations = await db
  //   .collection<Location>('locations')
  //   .find()
  //   .toArray()

  // const [locationsToKeep, locationsToRemove] = _.partition(
  //   currentLocations,
  //   (location) =>
  //     incomingLocations.some(
  //       (incomingLocation) => incomingLocation.id === location.id
  //     )
  // )

  // const [, newLocations] = _.partition(incomingLocations, (location) =>
  //   locationsToKeep.some((l) => l.id === location.id)
  // )

  // if (locationsToRemove.length > 0) {
  //   await db
  //     .collection('locations')
  //     .deleteMany({ id: { $in: locationsToRemove.map((l) => l.id) } })
  // }

  // if (newLocations.length > 0) {
  //   await db.collection('locations').insertMany(newLocations)
  //}
}

export const getLocations = () => {
  // eslint-disable-next-line no-console
  console.error('getLocations is not implemented yet')
  // const db = await events.getClient()

  // return db.collection<Location>('locations').find().toArray()
  return []
}
