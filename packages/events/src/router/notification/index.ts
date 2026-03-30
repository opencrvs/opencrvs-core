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

import { TRPCError } from '@trpc/server'
import * as z from 'zod/v4'
import { hasScope, SCOPES } from '@opencrvs/commons'
import { router, userOnlyProcedure } from '@events/router/trpc'
import { getClient } from '@events/storage/postgres/events'
import {
  countTodayNotifications,
  createNotification
} from '@events/storage/postgres/events/notifications'
import { DAILY_NOTIFICATION_LIMIT } from '@events/workers/notificationWorker'

export const notificationRouter = router({
  broadcast: userOnlyProcedure
    .input(
      z.object({
        subject: z.string(),
        body: z.string(),
        locale: z.string()
      })
    )
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      if (!hasScope(ctx.token, SCOPES.CONFIG_UPDATE_ALL)) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const todayCount = await countTodayNotifications()
      if (todayCount >= DAILY_NOTIFICATION_LIMIT) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'A broadcast has already been sent today'
        })
      }

      const db = getClient()

      const admin = await db
        .selectFrom('users')
        .select('id')
        .where('legacyId', '=', ctx.user.id)
        .executeTakeFirst()

      if (!admin) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Logged-in user not found in database'
        })
      }

      const activeUsers = await db
        .selectFrom('users')
        .select('email')
        .where('status', '=', 'active')
        .where('email', 'is not', null)
        .execute()

      const recipients = activeUsers
        .map((u) => u.email)
        .filter((e): e is string => e !== null)

      if (recipients.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No active users with email addresses found'
        })
      }

      await createNotification({
        subject: input.subject,
        body: input.body,
        locale: input.locale,
        recipients,
        createdBy: admin.id
      })

      return { success: true }
    })
})
