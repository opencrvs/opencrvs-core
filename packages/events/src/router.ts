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

import { initTRPC } from '@trpc/server'
import superjson from 'superjson'
import { z } from 'zod'

import {
  addAction,
  createEvent,
  EventInputWithId,
  getEventById,
  patchEvent
} from './service/events'
import {
  ActionDeclareInput,
  ActionNotifyInput,
  EventInput
} from '@events/schema'

const ContextSchema = z.object({
  user: z.object({
    id: z.string()
  })
})

type Context = z.infer<typeof ContextSchema>

export const t = initTRPC.context<Context>().create({
  transformer: superjson
})

const router = t.router
const publicProcedure = t.procedure

/**
 * @public
 */
export type AppRouter = typeof appRouter

export const appRouter = router({
  event: router({
    create: publicProcedure.input(EventInput).mutation(async (options) => {
      return createEvent(
        options.input,
        options.ctx.user.id,
        options.input.transactionId
      )
    }),
    patch: publicProcedure.input(EventInputWithId).mutation(async (options) => {
      return patchEvent(options.input)
    }),
    get: publicProcedure.input(z.string()).query(async ({ input }) => {
      return getEventById(input)
    }),
    actions: router({
      notify: publicProcedure.input(ActionNotifyInput).mutation((options) => {
        return addAction(options.input, {
          eventId: options.input.eventId,
          createdBy: options.ctx.user.id
        })
      }),
      declare: publicProcedure.input(ActionDeclareInput).mutation((options) => {
        return addAction(options.input, {
          eventId: options.input.eventId,
          createdBy: options.ctx.user.id
        })
      })
    })
  })
})
