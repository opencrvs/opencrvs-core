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

import { MINIO_BUCKET } from '@documents/minio/constants'
import { signFileUrl } from '@documents/minio/sign'
import * as Hapi from '@hapi/hapi'

export function createPreSignedUrl(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const fileUri = request.params.fileUri
  const payload = (
    fileUri ? { fileUri: `/${MINIO_BUCKET}/${fileUri}` } : request.payload
  ) as {
    fileUri: string
  }

  try {
    const presignedURL = signFileUrl(payload.fileUri)
    return h.response({ presignedURL }).code(200)
  } catch (error) {
    return h.response(error).code(400)
  }
}
