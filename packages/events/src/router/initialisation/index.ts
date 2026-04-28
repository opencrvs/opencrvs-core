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
import { initialisationProcedure, serviceRouter } from '@events/router/trpc'
import { generateHash } from '@events/service/auth/hash'
import {
  completeSystemInitialisation,
  getSystemInitialisation
} from '@events/service/auth'
import { setAdministrativeAreasRoute } from '../administrative-areas'
import { listLocationsRoute, setLocationsRoute } from '../locations'
import { createUserRoute, searchUsersRoute } from '../user'

/**
 * initialisationRouter contains routes related to the initialisation of the system, such as authenticating the initial "super user" and creating the administrative hierarchy.
 * These routes are intended to be used only during the initial setup of the system and are protected accordingly.
 */
export const initialisationRouter = serviceRouter({
  authenticate: initialisationProcedure
    .input(z.object({ password: z.string() }))
    .output(z.object({ valid: z.boolean() }))
    .mutation(async ({ input }) => {
      const systemInitialisation = await getSystemInitialisation()

      if (systemInitialisation.completedAt !== null) {
        throw new TRPCError({
          code: 'UNAUTHORIZED'
        })
      }

      const hash = await generateHash(input.password, systemInitialisation.salt)
      if (hash !== systemInitialisation.hash) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      return { valid: true }
    }),
  complete: initialisationProcedure.mutation(async () => {
    await completeSystemInitialisation()
  }),
  administrativeAreas: {
    set: setAdministrativeAreasRoute(initialisationProcedure)
  },
  locations: {
    set: setLocationsRoute(initialisationProcedure),
    list: listLocationsRoute(initialisationProcedure)
  },
  users: {
    search: searchUsersRoute(initialisationProcedure),
    create: createUserRoute(initialisationProcedure)
  }
})

/** @knipignore */
export type InitialisationRouter = typeof initialisationRouter
