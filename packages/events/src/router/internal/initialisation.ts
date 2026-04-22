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
import { internalProcedure, internalRouter } from '@events/router/trpc'
import { generateHash } from '@events/service/auth/hash'
import {
  completeSystemInitialisation,
  getSystemInitialisation
} from '@events/service/auth'
import { setAdministrativeAreasRoute } from '../administrative-areas'
import { listLocationsRoute, setLocationsRoute } from '../locations'

/**
 * initialisationRouter contains routes related to the initialisation of the system, such as setting up the initial admin user and creating the first office location.
 * These routes are intended to be used only during the initial setup of the system and are protected accordingly.
 */
export const initialisationRouter = internalRouter({
  authenticate: internalProcedure
    .input(z.object({ password: z.string() }))
    .output(z.object({ valid: z.boolean() }))
    .mutation(async ({ input }) => {
      const systemInitialisation = await getSystemInitialisation()

      if (systemInitialisation.completedAt !== null) {
        throw new TRPCError({
          code: 'UNAUTHORIZED'
        })
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
  complete: internalProcedure.mutation(async () => {
    const systemInitialisation = await getSystemInitialisation()

    if (systemInitialisation.completedAt !== null) {
      throw new TRPCError({
        code: 'CONFLICT'
      })
    }

    await completeSystemInitialisation()
  }),
  administrativeAreas: {
    set: setAdministrativeAreasRoute(internalProcedure)
  },
  locations: {
    set: setLocationsRoute(internalProcedure),
    list: listLocationsRoute(internalProcedure)
  }
})
