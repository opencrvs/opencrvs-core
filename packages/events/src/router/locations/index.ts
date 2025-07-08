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
import { SCOPES } from '@opencrvs/commons'
import { router, publicProcedure, systemProcedure } from '@events/router/trpc'
import { requiresAnyOfScopes } from '@events/router/middleware/authorization'
import {
  getLocations,
  Location,
  setLocations
} from '@events/service/locations/locations'

export const locationRouter = router({
  set: systemProcedure
    .use(requiresAnyOfScopes([SCOPES.USER_DATA_SEEDING]))
    .input(z.array(Location).min(1))
    .mutation(async (options) => {
      await setLocations(options.input)
    }),
  get: publicProcedure.output(z.array(Location)).query(getLocations)
})
