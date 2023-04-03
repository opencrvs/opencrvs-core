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
import { fetchDocuments } from '@gateway/features/fhir/utils'

export async function getPresignedMinioURLHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const fileName = request.params.fileName
  const response = await fetchDocuments(
    '/presigned-url',
    request.headers.authorization,
    'POST',
    JSON.stringify({ fileName: fileName })
  )
  return response
}
