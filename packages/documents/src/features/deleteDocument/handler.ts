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
import jwtDecode from 'jwt-decode'

export async function deleteDocument(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const fileUri = request.params.fileUri

  const userId = (jwtDecode(request.headers.authorization) as any).sub
  if (!userId)
    return Promise.reject(
      new Error(
        `request failed: Authorization token is missing or does not contain a valid user ID.`
      )
    )

  try {
    const stat = await minioClient.statObject(MINIO_BUCKET, fileUri)
    const uploader = stat.metaData.uploader
    if (uploader !== userId)
      return h
        .response(
          `request failed: user with id ${userId} does not have permission to delete this document`
        )
        .code(403)
    await minioClient.removeObject(MINIO_BUCKET, fileUri)

    return h.response().code(204)
  } catch (error) {
    return h.response(error).code(400)
  }
}
