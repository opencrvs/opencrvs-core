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
import { putObject } from '@documents/s3/client'
import { S3_BUCKET } from '@documents/s3/constants'
import * as Hapi from '@hapi/hapi'
import { v4 as uuid } from 'uuid'
import isSvg from 'is-svg'
import { badRequest } from '@hapi/boom'
import { getUserId } from '@opencrvs/commons'

export interface IDocumentPayload {
  fileData: string
  metaData?: Record<string, string>
}

export async function svgUploadHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const userId = getUserId(request.headers.authorization as `Bearer ${string}`)
  if (!userId)
    return Promise.reject(
      new Error(
        `request failed: Authorization token is missing or does not contain a valid user ID.`
      )
    )
  const ref = uuid()
  const bufferData = request.payload as Buffer
  if (!isSvg(bufferData)) {
    throw badRequest()
  }
  const generateFileName = `${ref}.svg`
  try {
    await putObject(generateFileName, bufferData, {
      'content-type': 'image/svg+xml',
      'created-by': userId
    })

    return h.response({ refUrl: `/${S3_BUCKET}/${generateFileName}` }).code(200)
  } catch (error) {
    return h.response(error as Error).code(400)
  }
}
