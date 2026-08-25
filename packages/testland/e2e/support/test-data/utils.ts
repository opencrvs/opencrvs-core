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
import { v4 as uuidv4 } from 'uuid'
import { GATEWAY_HOST } from '@e2e/support/constants'
import fs from 'fs'
import path from 'path'
import { ASSETS_DIR } from '@e2e/support/paths'

export function getSignatureFile() {
  const buffer = fs.readFileSync(path.join(ASSETS_DIR, 'signature.png'))
  // Uint8Array copy: Buffer is not a BlobPart under newer @types/node
  // (Buffer<ArrayBufferLike> vs ArrayBufferView<ArrayBuffer>)
  return new File([new Uint8Array(buffer)], `signature-${Date.now()}.png`, {
    type: 'image/png'
  })
}

export async function uploadFile(file: File, token: string) {
  const formData = new FormData()
  const transactionId = uuidv4()
  formData.append('file', file)
  formData.append('transactionId', transactionId)

  const url = new URL('/upload', GATEWAY_HOST)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  })

  if (!res.ok) {
    throw new Error(`Failed to upload file: ${res.statusText}`)
  }

  return {
    path: await res.text(),
    originalFilename: file.name,
    type: file.type
  }
}
