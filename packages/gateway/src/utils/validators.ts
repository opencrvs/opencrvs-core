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
import { fromBuffer } from 'file-type'

export async function validateAttachments(
  attachments: Array<{ data: string }>
) {
  for (const file of attachments) {
    const data = file.data.split('base64,')?.[1] || ''
    const mime = file.data.split(';')[0].replace('data:', '')

    if (!mime.startsWith('image/')) {
      throw new Error(`File type doesn't match image/*`)
    }

    const buffer = Buffer.from(data, 'base64')
    const type = await fromBuffer(buffer)
    if (!type) {
      throw new Error("File type couldn't be determined")
    }

    if (!type.mime.startsWith('image/')) {
      throw new Error(`File type doesn't match image/*`)
    }
  }
}
