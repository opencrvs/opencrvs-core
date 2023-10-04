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
import { v4 as uuid } from 'uuid'
import { fromBuffer } from 'file-type'

export interface IDocumentPayload {
  fileData: string
  metaData?: Record<string, string>
}

export type IFileInfo = {
  ext: string
  mime: string
}

export async function documentUploadHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IDocumentPayload
  const ref = uuid()
  try {
    const base64String = payload.fileData.split(',')[1]
    const base64Decoded = Buffer.from(base64String, 'base64')
    const fileType = (await fromBuffer(base64Decoded)) as IFileInfo
    const generateFileName = `${ref}.${fileType.ext}`

    await minioClient.putObject(MINIO_BUCKET, generateFileName, base64Decoded, {
      'content-type': fileType.mime,
      ...payload.metaData
    })

    return h
      .response({ refUrl: `/${MINIO_BUCKET}/${generateFileName}` })
      .code(200)
  } catch (error) {
    return Promise.reject(new Error(`request failed: ${error.message}`))
  }
}
