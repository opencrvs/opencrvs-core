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
import fetch from 'node-fetch'
import { DOCUMENT_URL } from '@config/config/constants'
import { IAuthHeader } from './fhirService'
import { internal } from '@hapi/boom'
import { logger } from '@config/logger'

export async function uploadDocument(
  fileData: string,
  authHeader: IAuthHeader
) {
  const url = new URL('upload-svg', DOCUMENT_URL).toString()
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...authHeader,
      'Content-Type': 'image/svg+xml'
    },
    body: Buffer.from(fileData)
  })
  if (!res.ok) {
    logger.error(await res.json())
    throw internal()
  }
  return (await res.json()).refUrl
}

export async function getDocumentUrl(fileUri: string, authHeader: IAuthHeader) {
  const url = new URL('/presigned-url', DOCUMENT_URL).toString()
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ filename: fileUri })
  })
  if (!res.ok) {
    logger.error(await res.json())
    throw internal()
  }
  return (await res.json()).presignedURL
}
