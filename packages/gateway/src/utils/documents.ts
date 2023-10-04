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
import fetch from 'node-fetch'
import { DOCUMENTS_URL } from '@gateway/constants'
import { internal } from '@hapi/boom'
import { logger } from '@gateway/logger'
import { IAuthHeader } from '@opencrvs/commons'

export async function uploadSvg(fileData: string, authHeader: IAuthHeader) {
  const url = new URL('upload-svg', DOCUMENTS_URL).toString()
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
