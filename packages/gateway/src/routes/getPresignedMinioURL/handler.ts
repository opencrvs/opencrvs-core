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
import * as Hapi from '@hapi/hapi'
import { fetchDocuments } from '@gateway/features/fhir/utils'

export async function getPresignedMinioURLHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const fileUri = request.params.fileUri
  const response = await fetchDocuments(
    '/presigned-url',
    { Authorization: request.headers.authorization },
    'POST',
    JSON.stringify({ fileUri })
  )
  return response
}
