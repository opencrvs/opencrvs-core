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
import { User } from '@opencrvs/commons'
import { router, publicProcedure } from '@events/router/trpc'
import { getUsersById } from '@events/service/users/users'
import { getUserActions } from '@events/service/events/user-actions'
import { UserActionsQuery } from '@events/storage/postgres/events/actions'

export const userRouter = router({
  get: publicProcedure
    .input(z.string())
    .output(User)
    .query(async (options) => {
      const [user] = await getUsersById([options.input], options.ctx.token)

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return user
    }),
  list: publicProcedure
    .input(z.array(z.string()))
    .query(async (options) => getUsersById(options.input, options.ctx.token)),
  actions: publicProcedure.input(UserActionsQuery).query(async (options) => {
    return getUserActions(options.input)
  })
})
