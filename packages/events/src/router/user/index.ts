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
import { UserAuditRecordInput } from '@opencrvs/commons/events'
import {
  router,
  userAndSystemProcedure,
  userOnlyProcedure
} from '@events/router/trpc'
import { getUsersById } from '@events/service/users/users'
import { getUserActions } from '@events/service/events/user/actions'
import { UserActionsQuery } from '@events/storage/postgres/events/actions'
import {
  queryUserAuditLog,
  writeAuditLog
} from '@events/storage/postgres/events/auditLog'
import { userCanReadOtherUser } from '../middleware'

const UserAuditListQuery = z.object({
  userId: z.string(),
  skip: z.number().optional().default(0),
  count: z.number().optional().default(10),
  timeStart: z.string().optional(),
  timeEnd: z.string().optional()
})

const AuditLogEntry = z.object({
  id: z.string(),
  clientId: z.string(),
  clientType: z.string(),
  operation: z.string(),
  requestData: z.record(z.string(), z.unknown()).nullable(),
  responseSummary: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.string()
})

const auditRouter = router({
  record: userAndSystemProcedure
    .input(UserAuditRecordInput)
    .mutation(async ({ input, ctx }) => {
      await writeAuditLog({
        ...input,
        clientId: ctx.user.id,
        clientType: ctx.user.type
      })
    }),
  list: userOnlyProcedure
    .input(UserAuditListQuery)
    .output(z.object({ results: z.array(AuditLogEntry), total: z.number() }))
    .use(userCanReadOtherUser)
    .query(async ({ input }) => {
      return queryUserAuditLog({
        subjectId: input.userId,
        skip: input.skip,
        count: input.count,
        timeStart: input.timeStart,
        timeEnd: input.timeEnd
      })
    })
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
  audit: auditRouter
})
