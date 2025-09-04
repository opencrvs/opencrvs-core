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
import { TRPCError } from '@trpc/server'
import { SCOPES } from '@opencrvs/commons'
import { publicProcedure, router, systemProcedure } from '@events/router/trpc'
import {
  getLocations,
  getLocationById,
  Location,
  setLocations,
  syncLocations
} from '@events/service/locations/locations'
import { requiresAnyOfScopes } from '../middleware'

export const locationRouter = router({
  sync: systemProcedure
    .use(
      requiresAnyOfScopes([SCOPES.USER_DATA_SEEDING, SCOPES.CONFIG_UPDATE_ALL])
    )
    .input(z.void())
    .output(z.void())
    .meta({
      openapi: {
        summary: 'Sync locations between V1 and V2',
        method: 'POST',
        path: '/sync-locations',
        tags: ['events'],
        protect: true
      }
    })
    .mutation(async () => {
      await syncLocations()
    }),
  list: publicProcedure.output(z.array(Location)).query(getLocations),
  get: publicProcedure
    .input(z.string().uuid().brand<'UUID'>()) // branded UUID
    .output(Location)
    .query(async ({ input }) => {
      const location = await getLocationById(input)

      if (!location) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return {
        id: location.id,
        name: location.name,
        parentId: location.parentId,
        validUntil: location.validUntil
          ? new Date(location.validUntil).toISOString()
          : null
      } as Location
    }),
  set: systemProcedure
    .use(requiresAnyOfScopes([SCOPES.USER_DATA_SEEDING]))
    .input(z.array(Location).min(1))
    .output(z.void())
    .mutation(async ({ input }) => {
      await setLocations(input)
    })
})
