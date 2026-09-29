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

import { minioClient } from '@documents/minio/client'
import { MINIO_BUCKET } from '@documents/minio/constants'
import * as Hapi from '@hapi/hapi'
import { badRequest, forbidden } from '@hapi/boom'
import {
  DOCUMENT_DELETE_SCOPES,
  DocumentPath,
  hasAnyScope,
  isAttachmentPath
} from '@opencrvs/commons'

/** See {@link DOCUMENT_DELETE_SCOPES} for why the check is by scope. */
function assertCallerCanDelete(token: string) {
  if (!hasAnyScope(token, DOCUMENT_DELETE_SCOPES)) {
    throw forbidden('request failed: caller may not delete documents')
  }
}

export async function deleteDocument(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  assertCallerCanDelete(request.headers.authorization as string)

  const documentPath = DocumentPath.parse(request.params.filePath)

  try {
    await minioClient.statObject(MINIO_BUCKET, documentPath)
  } catch (error) {
    if ((error as { code?: string }).code === 'NotFound') {
      return h
        .response(
          `request failed: document ${documentPath} does not exist in bucket ${MINIO_BUCKET}`
        )
        .code(404)
    }

    throw error
  }

  await minioClient.removeObject(MINIO_BUCKET, documentPath)

  return h.response().code(204)
}

/**
 * Deletes every object under a record's or a user's prefix. A record that is
 * gone owns nothing, so its prefix goes with it, including files no action ever
 * referenced.
 */
export async function deletePrefix(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  assertCallerCanDelete(request.headers.authorization as string)

  const prefix = request.params.prefix.endsWith('/')
    ? request.params.prefix
    : `${request.params.prefix}/`

  /*
   * Only a whole record's or a whole user's prefix may go at once. Anything
   * looser would let one request empty the bucket.
   */
  if (!isAttachmentPath(prefix)) {
    throw badRequest(
      `request failed: ${prefix} is not a record or user prefix, refusing to delete`
    )
  }

  const names: string[] = []

  for await (const object of minioClient.listObjectsV2(
    MINIO_BUCKET,
    prefix,
    true
  )) {
    if (object.name) {
      names.push(object.name)
    }
  }

  if (names.length > 0) {
    await minioClient.removeObjects(MINIO_BUCKET, names)
  }

  return h.response({ deleted: names.length }).code(200)
}
