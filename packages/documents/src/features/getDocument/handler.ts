/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import { MINIO_PRESIGNED_URL_EXPIRY_IN_SECOND } from '@documents/constants'
import { minioClient } from '@documents/minio/client'
import { MINIO_BUCKET } from '@documents/minio/constants'
import * as Hapi from '@hapi/hapi'

export async function fetchDocumentHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as { fileName: string }
  try {
    const presignedURL = await minioClient.presignedGetObject(
      MINIO_BUCKET,
      payload.fileName,
      MINIO_PRESIGNED_URL_EXPIRY_IN_SECOND
    )
    return h.response({ presignedURL: presignedURL }).code(200)
  } catch (error) {
    return h.response(error).code(400)
  }
}
