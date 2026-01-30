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
import { AdministrativeArea, SCOPES, UUID } from '@opencrvs/commons'
import { router, userAndSystemProcedure } from '@events/router/trpc'
import {
  getAdministrativeAreas,
  setAdministrativeAreas
} from '../../service/administrative-areas'
import { requiresAnyOfScopes } from '../middleware'

export const administrativeAreaRouter = router({
  list: userAndSystemProcedure
    .input(
      z
        .object({
          isActive: z.boolean().optional(),
          ids: z.array(UUID).optional()
        })
        .optional()
    )
    .output(z.array(AdministrativeArea))
    .query(async ({ input }) =>
      getAdministrativeAreas({
        isActive: input?.isActive,
        ids: input?.ids
      })
    ),
  set: userAndSystemProcedure
    .use(
      requiresAnyOfScopes([SCOPES.USER_DATA_SEEDING, SCOPES.CONFIG_UPDATE_ALL])
    )
    .input(z.array(AdministrativeArea).min(1))
    .output(z.void())
    .mutation(async ({ input }) => setAdministrativeAreas(input))
})
