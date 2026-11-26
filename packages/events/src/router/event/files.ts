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
import { UUID } from '@opencrvs/commons'
import * as middleware from '@events/router/middleware'
import { router, userAndSystemProcedure } from '@events/router/trpc'
import { getEventById } from '@events/service/events/events'
import { presignFiles } from '@events/service/files'
import { getReadableEventFiles } from '@events/service/files/authorize'
import { writeAuditLog } from '@events/storage/postgres/events/auditLog'

export const filesRouter = router({
  /**
   * Presigned URLs for every file the record names, keyed by the path the
   * record stores, so the client can cache each file under that path.
   */
  presign: userAndSystemProcedure
    .input(z.object({ eventId: UUID }))
    .use(middleware.canAccessEventWithScopes(['record.read']))
    .output(z.record(z.string(), z.string()))
    .query(async ({ ctx }) => {
      const event = await getEventById(ctx.eventId)
      const paths = await getReadableEventFiles(ctx, event)
      const urls = await presignFiles(paths, ctx.token)

      await writeAuditLog({
        clientId: ctx.user.id,
        clientType: ctx.user.type,
        operation: 'event.files.presign',
        requestData: { eventId: ctx.eventId },
        responseSummary: { files: paths }
      })

      return urls
    })
})
