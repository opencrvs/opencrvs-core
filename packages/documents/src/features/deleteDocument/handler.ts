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

import {
  listObjectKeys,
  removeObject,
  removeObjects,
  statObjectIfExists
} from '@documents/s3/client'
import { S3_BUCKET } from '@documents/s3/constants'
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

  if (!(await statObjectIfExists(documentPath))) {
    return h
      .response(
        `request failed: document ${documentPath} does not exist in bucket ${S3_BUCKET}`
      )
      .code(404)
  }

  await removeObject(documentPath)

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

  const names = await listObjectKeys(prefix)

  if (names.length > 0) {
    await removeObjects(names)
  }

  return h.response({ deleted: names.length }).code(200)
}
