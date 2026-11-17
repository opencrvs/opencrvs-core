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

import { listObjectKeys } from '@documents/s3/client'
import { env } from '@documents/s3/constants'
import { signFileUrl } from '@documents/s3/sign'
import * as Hapi from '@hapi/hapi'
import { badRequest } from '@hapi/boom'
import { isAttachmentPath } from '@opencrvs/commons'
import { z } from 'zod'

export async function createPreSignedUrl(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  let filePath = request.params.filePath
    ? request.params.filePath
    : (request.payload as { filePath: string }).filePath

  if (filePath.startsWith('/')) {
    filePath = filePath.slice(1)
  }

  if (filePath.startsWith(env.S3_BUCKET)) {
    filePath = filePath.slice(env.S3_BUCKET.length + 1)
  }

  try {
    const presignedURL = await signFileUrl(filePath)
    return h.response({ presignedURL }).code(200)
  } catch (error) {
    return h.response(error as Error).code(400)
  }
}

const BulkPayload = z.object({
  filenames: z.array(z.string())
})

export async function createPresignedUrlsInBulk(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = BulkPayload.safeParse(request.payload)

  if (!payload.success) {
    return h.response(payload.error).code(400)
  }

  const response = await Promise.all(
    payload.data.filenames.map((filename) => signFileUrl(filename))
  )

  return h.response(response).code(200)
}

export async function listFiles(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { prefix } = request.params

  // Anything looser than a record's or a user's prefix would list the bucket
  if (!isAttachmentPath(prefix)) {
    throw badRequest(
      `request failed: ${prefix} is not a record or user prefix, refusing to list`
    )
  }

  return h.response(await listObjectKeys(prefix))
}
