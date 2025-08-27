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
import { SCOPES, UUID } from '@opencrvs/commons'
import { router, publicProcedure, systemProcedure } from '@events/router/trpc'
import { requiresAnyOfScopes } from '@events/router/middleware/authorization'
import {
  addLocations,
  deleteLocations,
  getLocations,
  Location,
  LocationUpdate,
  NewLocation,
  setLocations,
  updateLocations
} from '@events/service/locations/locations'

export const locationRouter = router({
  set: systemProcedure
    .use(requiresAnyOfScopes([SCOPES.USER_DATA_SEEDING]))
    .input(z.array(Location).min(1))
    .mutation(async (options) => {
      await setLocations(options.input)
    }),
  add: systemProcedure
    .use(requiresAnyOfScopes([SCOPES.CONFIG_UPDATE_ALL]))
    .input(z.array(NewLocation).min(1))
    .mutation(async (options) => {
      await addLocations(options.input)
    }),
  update: systemProcedure
    .use(requiresAnyOfScopes([SCOPES.CONFIG_UPDATE_ALL]))
    .input(z.array(LocationUpdate).min(1))
    .mutation(async (options) => {
      await updateLocations(options.input)
    }),
  delete: systemProcedure
    .use(requiresAnyOfScopes([SCOPES.CONFIG_UPDATE_ALL]))
    .input(z.array(UUID))
    .mutation(async (options) => {
      await deleteLocations(options.input)
    }),
  get: publicProcedure.output(z.array(Location)).query(getLocations)
})
