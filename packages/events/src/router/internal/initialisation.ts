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
import { TRPCError } from '@trpc/server'
import { AdministrativeArea, Location, UUID } from '@opencrvs/commons'
import { internalProcedure, internalRouter } from '@events/router/trpc'
import { generateHash } from '@events/service/auth/hash'
import {
  completeSystemInitialisation,
  getSystemInitialisation
} from '@events/service/auth'
import { setAdministrativeAreas } from '@events/service/administrative-areas'
import { getLocations, setLocations } from '@events/service/locations/locations'

export const initialisationRouter = internalRouter({
  superuser: {
    verifyPassword: internalProcedure
      .input(z.object({ password: z.string() }))
      .output(z.object({ valid: z.boolean() }))
      .mutation(async ({ input }) => {
        const systemInitialisation = await getSystemInitialisation()

        if (systemInitialisation.completedAt !== null) {
          return { valid: false }
        }

        const hash = await generateHash(
          input.password,
          systemInitialisation.tokenSalt
        )
        if (hash !== systemInitialisation.tokenHash) {
          throw new TRPCError({ code: 'UNAUTHORIZED' })
        }

        return { valid: true }
      }),
    completeInitialisation: internalProcedure.mutation(async ({ input }) => {
      const systemInitialisation = await getSystemInitialisation()

      if (systemInitialisation.completedAt !== null) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'System is already set up'
        })
      }

      await completeSystemInitialisation()
    })
  },
  administrativeAreas: {
    set: internalProcedure
      .input(z.array(AdministrativeArea).min(1))
      .output(z.void())
      .mutation(async ({ input }) => setAdministrativeAreas(input))
  },
  locations: {
    set: internalProcedure
      .input(z.array(Location).min(1))
      .output(z.void())
      .mutation(async ({ input }) => {
        await setLocations(input)
      }),

    list: internalProcedure
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
})
