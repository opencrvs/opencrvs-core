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
import { File } from 'buffer'
import { zfd } from 'zod-form-data'
import { SCOPES } from '@opencrvs/commons'
import { router, userAndSystemProcedure } from '@events/router/trpc'
import { requiresAnyOfScopes } from '@events/router/middleware'
import { uploadFile } from '@events/service/files'

const FileSchema = z
  .any()
  .refine((val) => val instanceof File, 'file is required and must be a File')
  .meta({ openapi: { type: 'string', format: 'binary' } })

const AttachmentInput = z.object({
  file: FileSchema,
  transactionId: zfd.text(),
  path: zfd.text(z.string().min(1).optional())
})

export const attachmentsRouter = router({
  upload: userAndSystemProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/attachments',
        summary: 'Upload a file attachment',
        tags: ['Attachments'],
        protect: true,
        contentTypes: ['multipart/form-data']
      }
    })
    .input(AttachmentInput)
    .output(z.object({ fileUrl: z.string() }))
    .use(requiresAnyOfScopes([SCOPES.ATTACHMENT_UPLOAD]))
    .mutation(async ({ input, ctx }) => {
      return uploadFile(input, ctx.token)
    })
})
