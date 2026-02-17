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
import { octetInputParser } from '@trpc/server/http'
import { SCOPES } from '@opencrvs/commons'
import { router, userAndSystemProcedure } from '@events/router/trpc'
import { requiresAnyOfScopes } from '@events/router/middleware'
import { uploadFile } from '@events/service/files'

export const attachmentsRouter = router({
  upload: userAndSystemProcedure
    .input(octetInputParser)
    .output(z.object({ fileUrl: z.string() }))
    .use(requiresAnyOfScopes([SCOPES.ATTACHMENT_UPLOAD]))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.filename) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'filename query parameter is required'
        })
      }

      return uploadFile(input, ctx.filename, ctx.token)
    })
})
