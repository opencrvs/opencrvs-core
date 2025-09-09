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
import {
  findScope,
  getScopes,
  SearchScopeAccessLevels,
  WorkqueueConfig,
  WorkqueueCountInput,
  WorkqueueCountOutput
} from '@opencrvs/commons'
import { router, publicProcedure } from '@events/router/trpc'
import {
  getInMemoryEventConfigurations,
  getIMemoryWorkqueueConfigurations
} from '@events/service/config/config'
import { getEventCount } from '@events/service/indexing/indexing'
import { requireScopeForWorkqueues } from '@events/router/middleware'

export const workqueueRouter = router({
  config: router({
    list: publicProcedure
      .input(z.void())
      .output(z.array(WorkqueueConfig))
      .query(async (options) => {
        return getIMemoryWorkqueueConfigurations(options.ctx.token)
      })
  }),
  count: publicProcedure
    .input(WorkqueueCountInput)
    .use(requireScopeForWorkqueues)
    .output(WorkqueueCountOutput)
    .query(async (options) => {
      const scopes = getScopes({ Authorization: options.ctx.token })

      const searchScope = findScope(scopes, 'search')
      // Only to satisfy type checking, as findScope will return undefined if no scope is found
      if (!searchScope) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }
      const searchScopeOptions = searchScope.options as Record<
        string,
        SearchScopeAccessLevels
      >
      return getEventCount(
        options.input,
        await getInMemoryEventConfigurations(options.ctx.token),
        searchScopeOptions,
        options.ctx.user.primaryOfficeId
      )
    })
})
