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

import * as z from 'zod/v4'
import { Location, UUID } from '@opencrvs/commons'
import {
  internalProcedure,
  router,
  userAndSystemProcedure
} from '@events/router/trpc'
import {
  getLocationById,
  getLocationHierarchy,
  getLocations,
  setLocations
} from '@events/service/locations/locations'
import { allowedWithAnyOfScopes } from '../middleware'

export function listLocationsRoute(
  procedure: typeof internalProcedure | typeof userAndSystemProcedure
) {
  return procedure
    .input(
      z
        .object({
          isActive: z.boolean().optional(),
          locationIds: z.array(UUID).optional(),
          locationType: z.string().optional(),
          externalId: z.string().optional()
        })
        .optional()
    )
    .output(z.array(Location))
    .query(async ({ input }) =>
      getLocations({
        isActive: input?.isActive,
        locationIds: input?.locationIds,
        locationType: input?.locationType,
        externalId: input?.externalId
      })
    )
}

export function setLocationsRoute(
  procedure: typeof internalProcedure | typeof userAndSystemProcedure
) {
  return procedure
    .input(z.array(Location).min(1))
    .output(z.void())
    .mutation(async ({ input }) => {
      await setLocations(input)
    })
}

export const locationRouter = router({
  list: listLocationsRoute(
    userAndSystemProcedure.meta({
      openapi: {
        summary: 'List locations',
        description: 'Retrieve a list of locations based on provided filters.',
        method: 'GET',
        path: '/locations',
        tags: ['locations'],
        protect: true
      }
    })
  ),
  set: setLocationsRoute(
    userAndSystemProcedure.use(
      allowedWithAnyOfScopes(['user.data-seeding', 'config.update-all'])
    )
  ),
  get: userAndSystemProcedure
    .input(z.object({ id: UUID }))
    .output(Location)
    .query(async ({ input }) => getLocationById(input.id)),
  getLocationHierarchy: userAndSystemProcedure
    .input(z.object({ locationId: UUID }))
    .output(z.array(UUID))
    .query(async ({ input }) => {
      return getLocationHierarchy(input.locationId)
    })
})
