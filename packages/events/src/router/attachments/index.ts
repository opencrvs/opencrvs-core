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
import {
  DocumentPath,
  eventAttachmentPath,
  RecordScopeTypeV2,
  userAttachmentPath,
  UUID
} from '@opencrvs/commons'
import {
  allowedWithAnyOfScopes,
  canAccessEventWithScopes,
  canUploadUserAttachment
} from '@events/router/middleware'
import {
  router,
  userAndSystemProcedure,
  userOnlyProcedure
} from '@events/router/trpc'
import {
  AttachmentInput,
  getUploadKey,
  presignUpload,
  PresignUploadFields,
  uploadFile
} from '@events/service/files'
import { assertEventExists } from '@events/service/events/events'
import { writeAuditLog } from '@events/storage/postgres/events/auditLog'

/**
 * The record scopes that let a user fill in a form on a record. A user with
 * one of them may upload a file to the record.
 */
const EVENT_UPLOAD_SCOPES = [
  'record.declare',
  'record.notify',
  'record.edit',
  'record.register',
  'record.reject',
  'record.archive',
  'record.request-correction',
  'record.correct',
  'record.print-certified-copies',
  'record.revoke-registration',
  'record.reinstate-registration',
  'record.custom-action'
] satisfies RecordScopeTypeV2[]

const PresignedUploadOutput = z.object({
  url: z.string(),
  headers: z.record(z.string(), z.string()),
  path: DocumentPath
})

export const attachmentsRouter = router({
  /**
   * Gives the client a URL to upload one file of a record directly to the
   * object store.
   */
  presignEventUpload: userOnlyProcedure
    .input(PresignUploadFields.extend({ eventId: UUID }))
    .output(PresignedUploadOutput)
    .use(canAccessEventWithScopes(EVENT_UPLOAD_SCOPES))
    .mutation(async ({ input, ctx }) => {
      const path = getUploadKey(eventAttachmentPath(input.eventId), input)
      const upload = await presignUpload(path, input, ctx.token)

      await writeAuditLog({
        clientId: ctx.user.id,
        clientType: ctx.user.type,
        operation: 'attachments.presignEventUpload',
        requestData: {
          transactionId: input.transactionId,
          eventId: input.eventId,
          path
        },
        responseSummary: null
      })

      return { ...upload, path }
    }),
  /**
   * Gives the client a URL to upload the avatar or the signature of a user
   * directly to the object store.
   */
  presignUserUpload: userOnlyProcedure
    .input(PresignUploadFields.extend({ userId: UUID }))
    .output(PresignedUploadOutput)
    .use(canUploadUserAttachment)
    .mutation(async ({ input, ctx }) => {
      const path = getUploadKey(userAttachmentPath(input.userId), input)
      const upload = await presignUpload(path, input, ctx.token)

      await writeAuditLog({
        clientId: ctx.user.id,
        clientType: ctx.user.type,
        operation: 'attachments.presignUserUpload',
        requestData: {
          transactionId: input.transactionId,
          userId: input.userId,
          path
        },
        responseSummary: null
      })

      return { ...upload, path }
    }),
  upload: userAndSystemProcedure
    // This cannot be enabled as for whatever reason zod-form-data and trpc-to-openapi just do not play well together
    //  TypeError: Cannot use 'in' operator to search for 'Symbol(Symbol.iterator)' in undefined
    // OpenAPI spec is manually created and can be found here
    // packages/events/src/openapi.ts
    // .meta({
    //   openapi: {
    //     method: 'POST',
    //     path: '/attachments',
    //     summary: 'Upload a file attachment',
    //     tags: ['Attachments'],
    //     protect: true,
    //     contentTypes: ['multipart/form-data']
    //   }
    // })
    .input(AttachmentInput)
    .output(z.string())
    .use(allowedWithAnyOfScopes(['attachment.upload']))
    .mutation(async ({ input, ctx }) => {
      if (input.eventId) {
        await assertEventExists(input.eventId)
      }

      const fileUrl = await uploadFile(input, ctx.token)

      await writeAuditLog({
        clientId: ctx.user.id,
        clientType: ctx.user.type,
        operation: 'attachments.upload',
        requestData: {
          transactionId: input.transactionId,
          eventId: input.eventId,
          path: input.path ?? null
        },
        responseSummary: { fileUrl }
      })

      return fileUrl
    })
})
