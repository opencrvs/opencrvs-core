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
import { statObjectIfExists } from '@documents/s3/client'
import { signUploadUrl } from '@documents/s3/sign'
import * as Hapi from '@hapi/hapi'
import { badRequest, forbidden } from '@hapi/boom'
import {
  getUserId,
  MAX_UPLOAD_SIZE_BYTES,
  parseDocumentPath
} from '@opencrvs/commons'
import { z } from 'zod'

const Payload = z.object({
  // Only keys under a record's or a user's prefix, which deletion can reach
  filePath: z.string().refine((value) => {
    const kind = parseDocumentPath(value)?.kind
    return kind === 'event' || kind === 'user'
  }, 'Uploads must go under events/<eventId>/ or users/<userId>/'),
  contentType: z.string().min(1),
  contentLength: z.number().int().positive().max(MAX_UPLOAD_SIZE_BYTES)
})

/**
 * Returns a URL that lets the browser put one file directly in the store.
 * The caller (the events service) decides whether the user may upload to the
 * key. This handler only makes sure that the user does not replace a file of
 * a different user, the same as fileUploadHandler does.
 */
export async function presignUploadHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const userId = getUserId(request.headers.authorization as `Bearer ${string}`)
  const payload = Payload.safeParse(request.payload)

  if (!payload.success) {
    throw badRequest(payload.error.message)
  }

  const { filePath, contentType, contentLength } = payload.data

  const existing = await statObjectIfExists(filePath)

  if (existing && existing.metadata['created-by'] !== userId) {
    throw forbidden(
      `request failed: user with id ${userId} does not have permission to replace this document`
    )
  }

  return h.response(
    await signUploadUrl({
      key: filePath,
      contentType,
      contentLength,
      createdBy: userId
    })
  )
}
