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

// eslint-disable-next-line import/no-unassigned-import
import '@opencrvs/commons/monitoring'

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))

import { initTRPC } from '@trpc/server'
import { createHTTPServer } from '@trpc/server/adapters/standalone'
import { z } from 'zod'
import { createRecord, EventInput, getRecordById } from './storage'
import superjson from 'superjson'
const t = initTRPC.create({
  transformer: superjson
})

const router = t.router
const publicProcedure = t.procedure

export type AppRouter = typeof appRouter

const appRouter = router({
  createRecord: publicProcedure
    .input(
      z.object({
        transactionId: z.string(),
        record: EventInput
      })
    )
    .mutation(async (options) => {
      return createRecord(options.input.record, options.input.transactionId)
    }),
  getRecord: publicProcedure.input(z.string()).query(async ({ input }) => {
    return getRecordById(input)
  })
})

const server = createHTTPServer({
  router: appRouter
})

server.listen(5555)
