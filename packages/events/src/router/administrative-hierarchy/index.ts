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
import { router, userAndSystemProcedure } from '@events/router/trpc'
import { requiresAnyOfScopes } from '../middleware'
import { syncAdministrativeHierarchy } from '../../service/administrative-hierarchy'

export const administrativeHierarchyRouter = router({
  sync: userAndSystemProcedure
    .use(
      requiresAnyOfScopes([SCOPES.USER_DATA_SEEDING, SCOPES.CONFIG_UPDATE_ALL])
    )
    .input(z.void())
    .output(z.void())
    .mutation(syncAdministrativeHierarchy)
})
