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
import { hasScope, logger, SCOPES } from '@opencrvs/commons'
import { router, userOnlyProcedure } from '@events/router/trpc'
import { getClient } from '@events/storage/postgres/events'
import {
  collectActiveRecipientEmails,
  countTodayAnnouncements,
  createAnnouncement
} from '@events/storage/postgres/events/announcements'
import {
  DAILY_ANNOUNCEMENT_LIMIT,
  processNextAnnouncement
} from '@events/workers/announcementWorker'

export const announcementRouter = router({
  broadcast: userOnlyProcedure
    .input(
      z.object({
        subject: z.string().min(1),
        body: z.string().min(1),
        locale: z.string()
      })
    )
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      if (!hasScope(ctx.token, SCOPES.CONFIG_UPDATE_ALL)) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const todayCount = await countTodayAnnouncements()
      if (todayCount >= DAILY_ANNOUNCEMENT_LIMIT) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'A broadcast has already been sent today'
        })
      }

      const db = getClient()

      // TODO: replace with getUserById(ctx.user.id) once mongo user references
      // are removed and ctx.user.id is a postgres UUID directly.
      // https://github.com/opencrvs/opencrvs-core/issues/11885
      const admin = await db
        .selectFrom('users')
        .select(['id', 'email'])
        .where('legacyId', '=', ctx.user.id)
        .executeTakeFirst()

      if (!admin) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Logged-in user not found in database'
        })
      }

      const recipients = (await collectActiveRecipientEmails()).filter(
        (e) => e !== admin.email
      )

      if (recipients.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No active users with email addresses found'
        })
      }

      await createAnnouncement({
        subject: input.subject,
        body: input.body,
        locale: input.locale,
        recipients,
        createdBy: admin.id
      })

      processNextAnnouncement().catch((err) => {
        logger.error(
          `Announcement worker: post-broadcast trigger failed: ${err instanceof Error ? err.message : String(err)}`
        )
      })

      return { success: true }
    })
})
