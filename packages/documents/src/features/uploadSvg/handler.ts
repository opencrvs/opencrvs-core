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
import { minioClient } from '@documents/minio/client'
import { MINIO_BUCKET } from '@documents/minio/constants'
import * as Hapi from '@hapi/hapi'
import { v4 as uuid } from 'uuid'

export interface IDocumentPayload {
  fileData: string
  metaData?: Record<string, string>
}

export async function svgUploadHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const ref = uuid()
  const bufferData = request.payload as Buffer
  const generateFileName = `${ref}.svg`
  try {
    minioClient.putObject(MINIO_BUCKET, generateFileName, bufferData, {
      'content-type': 'image/svg+xml'
    })

    return h
      .response({ refUrl: `/${MINIO_BUCKET}/${generateFileName}` })
      .code(200)
  } catch (error) {
    return h.response(error).code(400)
  }
}
