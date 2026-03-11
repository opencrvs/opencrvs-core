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
import { DocumentPath, getUserId } from '@opencrvs/commons'

export async function deleteDocument(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  // Ensure file is still in the desired format. forwarding url from gateway,
  // '/files/{filePath*}' --> files//filename.jpg and the double slash is removed.
  const filePath = DocumentPath.parse(request.params.filePath)

  const userId = getUserId(request.headers.authorization)

  if (!userId)
    return Promise.reject(
      new Error(
        `request failed: Authorization token is missing or does not contain a valid user ID.`
      )
    )

  let stat

  try {
    stat = await minioClient.statObject(MINIO_BUCKET, filePath)
  } catch (error) {
    if (error.code === 'NotFound') {
      return h
        .response(
          `request failed: document ${filePath} does not exist in bucket ${MINIO_BUCKET}`
        )
        .code(404)
    }

    throw error
  }

  const createdBy = stat.metaData['created-by']

  if (createdBy !== userId) {
    return h
      .response(
        `request failed: user with id ${userId} does not have permission to delete this document`
      )
      .code(403)
  }

  await minioClient.removeObject(MINIO_BUCKET, filePath)

  return h.response().code(204)
}
