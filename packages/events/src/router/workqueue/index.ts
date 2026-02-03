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
import {
  RecordScopeV2,
  WorkqueueConfig,
  WorkqueueCountInput,
  WorkqueueCountOutput
} from '@opencrvs/commons'
import { router, userOnlyProcedure } from '@events/router/trpc'
import {
  getInMemoryEventConfigurations,
  getInMemoryWorkqueueConfigurations
} from '@events/service/config/config'
import { getEventCount } from '@events/service/indexing/indexing'
import {
  requiresAnyOfScopes,
  requireScopeForWorkqueues
} from '@events/router/middleware'

export const workqueueRouter = router({
  config: router({
    list: userOnlyProcedure
      .input(z.void())
      .output(z.array(WorkqueueConfig))
      .query(async (options) => {
        return getInMemoryWorkqueueConfigurations(options.ctx.token)
      })
  }),
  count: userOnlyProcedure
    .input(WorkqueueCountInput)
    .use(requireScopeForWorkqueues)
    .use(requiresAnyOfScopes([], undefined, ['record.search']))
    .output(WorkqueueCountOutput)
    .query(async ({ ctx, input }) => {
      if (!ctx.acceptedScopes) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      return getEventCount({
        queries: input,
        user: ctx.user,
        eventConfigs: await getInMemoryEventConfigurations(ctx.token),
        acceptedScopes: ctx.acceptedScopes as RecordScopeV2[]
      })
    })
})
