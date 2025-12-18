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
  AnyScope,
  decodeScope,
  findScope,
  getScopes,
  RecordScopeV2,
  SearchScopeAccessLevels,
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
import { requireScopeForWorkqueues } from '@events/router/middleware'

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
    .output(WorkqueueCountOutput)
    .query(async ({ ctx, input }) => {
      const scopes = getScopes(ctx.token)
      const searchScope = findScope(scopes, 'search')
      // WIP code to allow writing E2E's against remote server. Should not be merged as is.
      const v2Scopes = scopes
        .map((scope) => {
          const parsedScope = decodeScope(scope)
          return parsedScope && ['record.search'].includes(parsedScope.type)
            ? parsedScope
            : null
        })
        .filter((scope): scope is z.infer<typeof AnyScope> => scope !== null)

      if (v2Scopes.length > 0) {
        return getEventCount({
          queries: input,
          eventConfigs: await getInMemoryEventConfigurations(ctx.token),
          user: ctx.user,
          acceptedScopes: v2Scopes as RecordScopeV2[]
        })
      }

      // Only to satisfy type checking, as findScope will return undefined if no scope is found
      if (!searchScope) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }
      const searchScopeOptions = searchScope.options as Record<
        string,
        SearchScopeAccessLevels
      >

      return getEventCount({
        queries: input,
        eventConfigs: await getInMemoryEventConfigurations(ctx.token),
        options: searchScopeOptions,
        user: ctx.user
      })
    })
})
