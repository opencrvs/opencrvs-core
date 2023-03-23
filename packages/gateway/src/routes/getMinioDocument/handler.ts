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
import * as Hapi from '@hapi/hapi'
import { MINIO_URL } from '@gateway/constants'
import fetch from 'node-fetch'
import { fromBuffer } from 'file-type'

export async function getDocumentHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const minioDocumentName = request.query.documentName
  const minioDocumentURL = new URL(`${minioDocumentName}`, MINIO_URL).toString()
  try {
    const response = await fetch(minioDocumentURL)
    const fileBuffer = await response.buffer()
    const fileType = await fromBuffer(fileBuffer)
    if (fileType) {
      return h.response(fileBuffer).type(fileType.mime).code(200)
    }
    return h.response(fileBuffer).code(200)
  } catch (error) {
    return Promise.reject(new Error(`request failed: ${error.message}`))
  }
}
