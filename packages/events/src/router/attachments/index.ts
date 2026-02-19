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
import { zfd } from 'zod-form-data'
import { SCOPES } from '@opencrvs/commons'
import { router, userAndSystemProcedure } from '@events/router/trpc'
import { requiresAnyOfScopes } from '@events/router/middleware'
import { uploadFile } from '@events/service/files'

const AttachmentInput = zfd.formData({
  file: zfd.file(),
  transactionId: zfd.text(),
  path: zfd.text(z.string().min(1).optional())
})

export const attachmentsRouter = router({
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
    .use(requiresAnyOfScopes([SCOPES.ATTACHMENT_UPLOAD]))
    .mutation(async ({ input, ctx }) => {
      return uploadFile(input, ctx.token)
    })
})
