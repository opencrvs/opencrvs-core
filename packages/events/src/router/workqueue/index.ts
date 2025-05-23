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
import {
  WorkqueueConfig,
  WorkqueueCountInput,
  WorkqueueCountOutput
} from '@opencrvs/commons'
import { router, publicProcedure } from '@events/router/trpc'
import { getWorkqueueConfigurations } from '@events/service/config/config'
import { getEventCount } from '@events/service/indexing/indexing'
import { requireScopeForWorkqueues } from '@events/router/middleware'

export const workqueueRouter = router({
  config: router({
    list: publicProcedure
      .meta({
        openapi: {
          summary: 'List workqueue configurations',
          method: 'GET',
          path: '/events/workqueue/config',
          tags: ['Workqueues']
        }
      })
      .input(z.void())
      .output(z.array(WorkqueueConfig))
      .query(async (options) => {
        return getWorkqueueConfigurations(options.ctx.token)
      })
  }),
  count: publicProcedure
    .input(WorkqueueCountInput)
    .use(requireScopeForWorkqueues)
    .output(WorkqueueCountOutput)
    .query(async (options) => {
      return getEventCount(options.input)
    })
})
