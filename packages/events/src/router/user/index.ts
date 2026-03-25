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
import { UserOrSystem, User } from '@opencrvs/commons'
import {
  router,
  userAndSystemProcedure,
  userOnlyProcedure
} from '@events/router/trpc'
import { getUsersById } from '@events/service/users/users'
import { getUserActions } from '@events/service/events/user/actions'
import { getRoles } from '@events/service/config/config'
import { UserActionsQuery } from '@events/storage/postgres/events/actions'
import {
  UserInput,
  searchUsers,
  createUser,
  activateUser
} from '@events/service/users/api'
import { userCanReadOtherUser } from '../middleware'

const UserSearch = z.object({
  username: z.string().optional(),
  mobile: z.string().optional(),
  status: z.string().optional(),
  primaryOfficeId: z.string().optional(),
  locationId: z.string().optional(),
  count: z.number().min(0),
  skip: z.number().min(0),
  sortOrder: z.enum(['asc', 'desc'])
})

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
  create: userAndSystemProcedure
    .input(UserInput)
    .output(User)
    .mutation(async ({ input, ctx }) => createUser(input, ctx.token)),
  list: userOnlyProcedure
    .input(z.array(z.string()))
    .output(z.array(UserOrSystem))
    .query(async ({ input, ctx }) => getUsersById(input, ctx.token)),
  search: userAndSystemProcedure
    .input(UserSearch)
    .output(z.array(UserOrSystem))
    .query(async ({ input, ctx }) => searchUsers(input, ctx.token)),
  actions: userOnlyProcedure
    .input(UserActionsQuery)
    .use(userCanReadOtherUser)
    .query(async ({ input }) => {
      return getUserActions(input)
    }),
  roles: router({
    list: userOnlyProcedure.query(async ({ ctx }) => getRoles(ctx.token))
  }),
  activate: userOnlyProcedure
    .input(z.any())
    .mutation(async ({ input, ctx }) => {
      return activateUser(input, ctx.token)
    })
})
