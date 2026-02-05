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
import { Location, SCOPES, UUID } from '@opencrvs/commons'
import { router, userAndSystemProcedure } from '@events/router/trpc'
import {
  getLocationHierarchy,
  getLocations,
  setLocations
} from '@events/service/locations/locations'
import { requiresAnyOfScopes } from '../middleware'

export const locationRouter = router({
  list: userAndSystemProcedure
    .meta({
      openapi: {
        summary: 'List locations',
        description: 'Retrieve a list of locations based on provided filters.',
        method: 'GET',
        path: '/locations',
        tags: ['locations'],
        protect: true
      }
    })
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
    ),
  set: userAndSystemProcedure
    .use(
      requiresAnyOfScopes([SCOPES.USER_DATA_SEEDING, SCOPES.CONFIG_UPDATE_ALL])
    )
    .input(z.array(Location).min(1))
    .output(z.void())
    .mutation(async ({ input }) => {
      await setLocations(input)
    }),
  getLocationHierarchy: userAndSystemProcedure
    .input(z.object({ locationId: UUID }))
    .output(z.array(UUID))
    .query(async ({ input }) => {
      return getLocationHierarchy(input.locationId)
    })
})
