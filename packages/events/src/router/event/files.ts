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
import { MiddlewareFunction } from '@trpc/server/unstable-core-do-not-import'
import { OpenApiMeta } from 'trpc-to-openapi'
import { DocumentPath, parseDocumentPath, UUID } from '@opencrvs/commons'
import { TrpcContext } from '@events/context'
import * as middleware from '@events/router/middleware'
import { router, userAndSystemProcedure } from '@events/router/trpc'
import { getEventById } from '@events/service/events/events'
import { presignFiles } from '@events/service/files'
import { getReadableEventFiles } from '@events/service/files/authorize'

const PresignFileInput = z.object({
  filePath: DocumentPath,
  // The record the file belongs to; implied by events/{eventId}/ paths
  eventId: UUID.optional()
})

type PresignMiddleware = MiddlewareFunction<
  TrpcContext,
  OpenApiMeta,
  TrpcContext,
  TrpcContext,
  unknown
>

/**
 * The old input shape named only the file. An events/{eventId}/ path names
 * its record, so fill in eventId from it for the access check that follows.
 */
async function inferEventIdFromPath({
  getRawInput,
  next
}: Parameters<PresignMiddleware>[0]): ReturnType<PresignMiddleware> {
  const input = PresignFileInput.safeParse(await getRawInput())

  if (!input.success || input.data.eventId) {
    return next()
  }

  const file = parseDocumentPath(input.data.filePath)

  if (file?.kind !== 'event') {
    return next()
  }

  return next({
    getRawInput: async () =>
      Promise.resolve({ ...input.data, eventId: file.eventId })
  })
}

export const fileRouter = router({
  /**
   * @deprecated Use `files.presign`, which signs every file the record
   * names in one call. Kept so existing integrations keep working.
   */
  getPresignedUrl: userAndSystemProcedure
    .input(PresignFileInput)
    .use(inferEventIdFromPath)
    .use(middleware.canAccessEventWithScopes(['record.read']))
    .output(z.object({ presignedURL: z.string() }))
    .query(async ({ input, ctx }) => {
      const event = await getEventById(ctx.eventId)
      const readable = await getReadableEventFiles(ctx, event)

      if (!readable.includes(input.filePath)) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const urls = await presignFiles([input.filePath], ctx.token)

      return { presignedURL: urls[input.filePath] }
    })
})

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

      return presignFiles(paths, ctx.token)
    })
})
