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
import { UserOrSystem } from '@opencrvs/commons'
import { router, userOnlyProcedure } from '@events/router/trpc'
import { getUsersById } from '@events/service/users/users'
import { getUserActions } from '@events/service/events/user/actions'
import { UserActionsQuery } from '@events/storage/postgres/events/actions'
import {
  migrateLegacyUsers,
  MigrationError
} from '@events/service/users/migrate-legacy-users'
import { userCanReadOtherUser } from '../middleware'

export const userRouter = router({
  get: userOnlyProcedure
    .input(z.string())
    .output(UserOrSystem)
    .query(async ({ input, ctx }) => {
      const users = await getUsersById([input], ctx.token)

      if (users.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return users[0]
    }),
  list: userOnlyProcedure
    .input(z.array(z.string()))
    .output(z.array(UserOrSystem))
    .query(async ({ input, ctx }) => getUsersById(input, ctx.token)),
  actions: userOnlyProcedure
    .input(UserActionsQuery)
    .use(userCanReadOtherUser)
    .query(async ({ input }) => {
      return getUserActions(input)
    }),
  migrateLegacyUsers: userOnlyProcedure.mutation(async () => {
    const errors = await migrateLegacyUsers()
    const toReadable = (error: MigrationError) =>
      `${error.errorType}: ${JSON.stringify(error.meta)}`
    if (errors.length > 0) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: errors.map(toReadable).join('\n')
      })
    }
  })
})
