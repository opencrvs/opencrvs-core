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

import { signFileUrl } from '@documents/minio/sign'
import * as Hapi from '@hapi/hapi'

export function createPreSignedUrl(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as { fileUri: string }
  try {
    const presignedURL = signFileUrl(payload.fileUri)
    return h.response({ presignedURL }).code(200)
  } catch (error) {
    return h.response(error).code(400)
  }
}
